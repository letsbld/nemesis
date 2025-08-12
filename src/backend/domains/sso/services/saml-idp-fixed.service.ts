import * as saml from 'saml2-js';
import { DOMParser } from 'xmldom';
import { UserService } from '../../user/services/user.service';

export class SamlIdpService {
    private static instance: SamlIdpService;
    private idp: saml.IdentityProvider;
    private serviceProviders: Map<string, saml.ServiceProvider> = new Map();
    private userService: UserService;

    private constructor() {
        this.userService = new UserService();
        this.initializeIdp();
        this.registerServiceProviders();
    }

    public static getInstance(): SamlIdpService {
        if (!SamlIdpService.instance) {
            SamlIdpService.instance = new SamlIdpService();
        }
        return SamlIdpService.instance;
    }

    private initializeIdp() {
        const options = {
            sso_login_url: `${process.env.NEXTAUTH_URL}/api/saml/sso/login`,
            sso_logout_url: `${process.env.NEXTAUTH_URL}/api/saml/sso/logout`,
            certificates: [this.getIdpCertificate()],
            sign_get_request: false,
            allow_unencrypted_assertion: process.env.NODE_ENV === 'development',
        };

        this.idp = new saml.IdentityProvider(options);
    }

    private registerServiceProviders() {
        // AWS Console SAML Configuration
        const awsOptions = {
            entity_id: 'urn:amazon:webservices',
            private_key: this.getSpPrivateKey(),
            certificate: this.getSpCertificate(),
            assert_endpoint: 'https://signin.aws.amazon.com/saml',
            force_authn: false,
            auth_context: {
                comparison: 'exact',
                class_refs: ['urn:oasis:names:tc:SAML:1.0:am:password'],
            },
            nameid_format: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
            sign_get_request: false,
            allow_unencrypted_assertion: process.env.NODE_ENV === 'development',
        };

        this.serviceProviders.set('aws', new saml.ServiceProvider(awsOptions));

        // Add more service providers here (Google Workspace, Microsoft 365, etc.)
    }

    async initiateLogin(
        serviceProvider: string,
        userId: string,
        attributes: Record<string, any> = {}
    ): Promise<string> {
        const sp = this.serviceProviders.get(serviceProvider);
        if (!sp) {
            throw new Error(`Service provider ${serviceProvider} not found`);
        }

        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create SAML assertion with user attributes
        const samlAttributes = {
            'https://aws.amazon.com/SAML/Attributes/Role': this.getUserAWSRoles(user),
            'https://aws.amazon.com/SAML/Attributes/RoleSessionName': user.username,
            'https://aws.amazon.com/SAML/Attributes/SessionDuration': '3600',
            ...attributes,
        };

        const options = {
            name_id: user.id.toString(),
            name_id_format: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
            attributes: samlAttributes,
            audience: (sp as any).entity_id,
            destination: (sp as any).assert_endpoint,
            recipient: (sp as any).assert_endpoint,
            in_response_to: attributes.requestId || '',
            authn_context_class:
                'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
        };

        return new Promise((resolve, reject) => {
            (this.idp as any).post_assert(sp, options, '', (error: any, saml_response: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(saml_response as string);
                }
            });
        });
    }

    async processLoginRequest(
        samlRequest: string,
        serviceProvider: string
    ): Promise<{
        requestId: string;
        destination: string;
        issuer: string;
    }> {
        const sp = this.serviceProviders.get(serviceProvider);
        if (!sp) {
            throw new Error(`Service provider ${serviceProvider} not found`);
        }

        // Parse the SAML request to extract necessary information
        const parser = new DOMParser();
        const doc = parser.parseFromString(
            Buffer.from(samlRequest, 'base64').toString(),
            'text/xml'
        );

        const requestId = doc.documentElement.getAttribute('ID') || '';
        const destination = doc.documentElement.getAttribute('Destination') || '';
        const issuerNode = doc.getElementsByTagName('saml:Issuer')[0];
        const issuer = issuerNode ? issuerNode.textContent || '' : '';

        return {
            requestId,
            destination,
            issuer,
        };
    }

    getMetadata(): string {
        // Generate SAML metadata manually since saml2-js might not expose the method properly
        const entityId = `${process.env.NEXTAUTH_URL}/api/saml/metadata`;
        const ssoUrl = `${process.env.NEXTAUTH_URL}/api/saml/sso/login`;
        const certificate = this.getIdpCertificate().replace(/-----BEGIN CERTIFICATE-----\n?/, '').replace(/\n?-----END CERTIFICATE-----/, '').replace(/\n/g, '');
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">
    <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>${certificate}</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:KeyDescriptor use="encryption">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>${certificate}</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${ssoUrl}"/>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${ssoUrl}"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
    }

    private getUserAWSRoles(user: any): string[] {
        // Map user roles to AWS IAM roles
        const roleMapping: Record<string, string[]> = {
            admin: [
                'arn:aws:iam::123456789012:role/AdminRole,arn:aws:iam::123456789012:saml-provider/DLPIdentityProvider',
            ],
            user: [
                'arn:aws:iam::123456789012:role/UserRole,arn:aws:iam::123456789012:saml-provider/DLPIdentityProvider',
            ],
        };

        return roleMapping[user.role] || roleMapping.user;
    }

    private getIdpCertificate(): string {
        // In production, load from secure storage or environment variables
        return process.env.SAML_IDP_CERTIFICATE || this.generateSelfSignedCertificate();
    }

    private getSpCertificate(): string {
        // Service Provider certificate (if needed)
        return process.env.SAML_SP_CERTIFICATE || this.generateSelfSignedCertificate();
    }

    private getSpPrivateKey(): string {
        // Service Provider private key (if needed)
        return process.env.SAML_SP_PRIVATE_KEY || this.generatePrivateKey();
    }

    private generateSelfSignedCertificate(): string {
        // For development only - in production, use proper certificates
        return `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKEeJqKpJtJyMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjQxMjMxMjM1OTU5WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA3vGP9HTzFJMV1UYZ6Xj9HACHxLlF6Xj9HAC1UYZ6Xj9HACHxLlF6Xj9H
ACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHx
LlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6
Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9H
ACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHx
LlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6
Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9HACHxLlF6Xj9H
ACHxLlF6Xj9HAQIDAQABoxMwETAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEB
CwUAA4IBAQCr3wKz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJ
rAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN
9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZ
CHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz
1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAs
tqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJ
-----END CERTIFICATE-----`;
    }

    private generatePrivateKey(): string {
        // For development only - in production, use proper private keys
        return `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDe8Y/0dPMUkxXV
RhnpeP0cAIfEuUXpeP0cALVRhnpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpe
P0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cA
IfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEu
UXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpe
P0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cA
IfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEu
UXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpeP0cAIfEuUXpe
P0cAIfEuUXpeP0cCAwEAAQKCAQEAhVl+OzqHdJ5s5JXt4t2tZ1xZqp5OgFoKAhvh
1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAs
tqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJ
rAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN
9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZ
CHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz
1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAs
tqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJ
rAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN
9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZ
CHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz
1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAs
tqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJ
rAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN9sPZCHqz1GAstqTJrAQN
-----END PRIVATE KEY-----`;
    }
}
