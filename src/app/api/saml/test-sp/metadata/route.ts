import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const testSPMetadata = `
    <?xml version="1.0"?>
    <md:EntityDescriptor
        xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                        entityID="${process.env.NEXTAUTH_URL}/test-sp">
        <md:SPSSODescriptor AuthnRequestsSigned="false"
                        WantAssertionsSigned="false"
                        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
            <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                                Location="${process.env.NEXTAUTH_URL}/api/saml/test-sp/sls"/>
            <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
            <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                    Location="${process.env.NEXTAUTH_URL}/api/saml/test-sp/acs"
                                    index="1"/>
        </md:SPSSODescriptor>
    </md:EntityDescriptor>
    `;


    return new NextResponse(testSPMetadata, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
