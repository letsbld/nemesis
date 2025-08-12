import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/backend/lib/auth-options';
import { SamlIdpService } from '@/backend/domains/sso/services/saml-idp-fixed.service';
import { DLPPolicyEngine, AccessRequest } from '@/backend/domains/sso/services/dlp-policy.service';

const samlIdpService = new SamlIdpService();
const policyEngine = new DLPPolicyEngine();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const samlRequest = searchParams.get('SAMLRequest');
        const relayState = searchParams.get('RelayState');
        const serviceProvider = searchParams.get('sp') || 'aws';

        if (!samlRequest) {
            return NextResponse.json({ error: 'Missing SAMLRequest parameter' }, { status: 400 });
        }

        // Parse the SAML request
        const requestInfo = await samlIdpService.processLoginRequest(samlRequest, serviceProvider);

        // Check if user is already authenticated
        const session = await getServerSession(authOptions);

        if (session?.user) {
            // Create access request for DLP policy evaluation
            const accessRequest: AccessRequest = {
                userId: (session.user as any).id,
                userRole: (session.user as any).role || 'user',
                serviceProvider,
                resource: requestInfo.destination,
                userAgent: request.headers.get('user-agent') || '',
                ipAddress:
                    request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown',
                deviceTrust: 'unknown', // In production, implement device fingerprinting
                mfaVerified: (session.user as any).mfaVerified || false,
                timestamp: new Date(),
            };

            // Evaluate DLP policies
            const policyDecision = await policyEngine.evaluateAccess(accessRequest);

            switch (policyDecision.decision) {
                case 'deny':
                    return new NextResponse(
                        `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Access Denied - DLP Policy</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif; 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    height: 100vh; 
                                    margin: 0;
                                    background-color: #fee;
                                }
                                .container {
                                    text-align: center;
                                    background: white;
                                    padding: 2rem;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    border: 2px solid #dc3545;
                                }
                                .error-icon {
                                    font-size: 3rem;
                                    color: #dc3545;
                                    margin-bottom: 1rem;
                                }
                                h1 { color: #dc3545; margin-bottom: 1rem; }
                                .reasons { 
                                    text-align: left; 
                                    background: #f8f9fa; 
                                    padding: 1rem; 
                                    border-radius: 4px; 
                                    margin: 1rem 0;
                                }
                                .contact {
                                    margin-top: 1.5rem;
                                    padding-top: 1rem;
                                    border-top: 1px solid #ddd;
                                    color: #666;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="error-icon">🚫</div>
                                <h1>Access Denied</h1>
                                <p>Your request to access <strong>${serviceProvider.toUpperCase()}</strong> has been denied by DLP policy.</p>
                                <div class="reasons">
                                    <strong>Reasons:</strong>
                                    <ul>
                                        ${policyDecision.reasons
                                            .map((reason) => `<li>${reason}</li>`)
                                            .join('')}
                                    </ul>
                                </div>
                                <div class="contact">
                                    <p>If you believe this is an error, please contact your security administrator.</p>
                                    <p><strong>Risk Score:</strong> ${
                                        policyDecision.riskScore
                                    }/10</p>
                                    <p><strong>Request ID:</strong> ${requestInfo.requestId}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                        {
                            status: 403,
                            headers: { 'Content-Type': 'text/html' },
                        }
                    );

                case 'require_mfa':
                    const mfaUrl = new URL('/auth/mfa', request.url);
                    mfaUrl.searchParams.set('returnUrl', request.url);
                    return NextResponse.redirect(mfaUrl);

                case 'require_approval':
                    return new NextResponse(
                        `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Approval Required - DLP Policy</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif; 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    height: 100vh; 
                                    margin: 0;
                                    background-color: #fff3cd;
                                }
                                .container {
                                    text-align: center;
                                    background: white;
                                    padding: 2rem;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    border: 2px solid #ffc107;
                                }
                                .warning-icon {
                                    font-size: 3rem;
                                    color: #ffc107;
                                    margin-bottom: 1rem;
                                }
                                h1 { color: #856404; margin-bottom: 1rem; }
                                .info { 
                                    text-align: left; 
                                    background: #f8f9fa; 
                                    padding: 1rem; 
                                    border-radius: 4px; 
                                    margin: 1rem 0;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="warning-icon">⚠️</div>
                                <h1>Approval Required</h1>
                                <p>Your request to access <strong>${serviceProvider.toUpperCase()}</strong> requires approval.</p>
                                <div class="info">
                                    <strong>Approval has been requested from:</strong>
                                    <ul>
                                        <li>Security Administrator</li>
                                    </ul>
                                    <p><strong>Risk Score:</strong> ${
                                        policyDecision.riskScore
                                    }/10</p>
                                    <p><strong>Request ID:</strong> ${requestInfo.requestId}</p>
                                </div>
                                <p>You will be notified once the approval is granted. Please check back later or contact your administrator.</p>
                            </div>
                        </body>
                        </html>
                    `,
                        {
                            status: 202,
                            headers: { 'Content-Type': 'text/html' },
                        }
                    );

                case 'allow':
                default:
                    // Generate SAML response and redirect to service provider
                    const samlResponse = await samlIdpService.initiateLogin(
                        serviceProvider,
                        (session.user as any).id,
                        {
                            requestId: requestInfo.requestId,
                            relayState,
                            riskScore: policyDecision.riskScore,
                        }
                    );

                    const redirectForm = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Redirecting to ${serviceProvider.toUpperCase()}...</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif; 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    height: 100vh; 
                                    margin: 0;
                                    background-color: #f5f5f5;
                                }
                                .container {
                                    text-align: center;
                                    background: white;
                                    padding: 2rem;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                }
                                .spinner {
                                    border: 3px solid #f3f3f3;
                                    border-top: 3px solid #28a745;
                                    border-radius: 50%;
                                    width: 30px;
                                    height: 30px;
                                    animation: spin 1s linear infinite;
                                    margin: 0 auto 1rem;
                                }
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                                .success-icon {
                                    font-size: 2rem;
                                    color: #28a745;
                                    margin-bottom: 1rem;
                                }
                                .security-info {
                                    background: #e7f3ff;
                                    padding: 1rem;
                                    border-radius: 4px;
                                    margin-top: 1rem;
                                    font-size: 0.9rem;
                                    color: #0c5460;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="success-icon">✅</div>
                                <div class="spinner"></div>
                                <h2>Access Approved</h2>
                                <p>Redirecting to ${serviceProvider.toUpperCase()}...</p>
                                <div class="security-info">
                                    <strong>🔒 DLP Protection Active</strong><br>
                                    Risk Score: ${policyDecision.riskScore}/10<br>
                                    Applied Policies: ${policyDecision.appliedPolicies.length}<br>
                                    This session is monitored for compliance.
                                </div>
                            </div>
                            <form id="samlForm" method="post" action="https://signin.aws.amazon.com/saml">
                                <input type="hidden" name="SAMLResponse" value="${Buffer.from(
                                    samlResponse
                                ).toString('base64')}" />
                                ${
                                    relayState
                                        ? `<input type="hidden" name="RelayState" value="${relayState}" />`
                                        : ''
                                }
                            </form>
                            <script>
                                setTimeout(() => {
                                    document.getElementById('samlForm').submit();
                                }, 2000);
                            </script>
                        </body>
                        </html>
                    `;

                    return new NextResponse(redirectForm, {
                        status: 200,
                        headers: {
                            'Content-Type': 'text/html',
                        },
                    });
            }
        } else {
            // User not authenticated, redirect to login with return URL
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', request.url);

            return NextResponse.redirect(loginUrl);
        }
    } catch (error) {
        console.error('SAML SSO Login Error:', error);
        return NextResponse.json(
            { error: 'SAML SSO login failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // Handle POST requests (same logic as GET but parse form data)
    try {
        const body = await request.formData();
        const samlRequest = body.get('SAMLRequest') as string;
        const relayState = body.get('RelayState') as string;

        // Create a new URL with query parameters for the GET handler
        const getUrl = new URL(request.url);
        getUrl.searchParams.set('SAMLRequest', samlRequest);
        if (relayState) {
            getUrl.searchParams.set('RelayState', relayState);
        }

        // Create a new request object for the GET handler
        const getRequest = new NextRequest(getUrl, {
            method: 'GET',
            headers: request.headers,
        });

        // Delegate to the GET handler
        return GET(getRequest);
    } catch (error) {
        console.error('SAML SSO POST Error:', error);
        return NextResponse.json(
            { error: 'SAML SSO login failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}
