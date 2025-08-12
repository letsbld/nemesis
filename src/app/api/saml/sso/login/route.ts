import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/backend/lib/auth-options';
import { SamlIdpService } from '@/backend/domains/sso/services/saml-idp-fixed.service';

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
        const samlIdpService = SamlIdpService.getInstance();
        const requestInfo = await samlIdpService.processLoginRequest(samlRequest, serviceProvider);

        // Check if user is already authenticated
        const session = await getServerSession(authOptions);

        if (session?.user) {
            // User is authenticated, generate SAML response
            const samlResponse = await samlIdpService.initiateLogin(
                serviceProvider,
                (session.user as any).id,
                {
                    requestId: requestInfo.requestId,
                    relayState,
                }
            );

            // Create auto-submit form to redirect user to AWS
            const redirectForm = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Redirecting to AWS Console...</title>
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
                            border-top: 3px solid #3498db;
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
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="spinner"></div>
                        <h2>Redirecting to AWS Console...</h2>
                        <p>Please wait while we redirect you to the AWS Management Console.</p>
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
                        }, 1000);
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
        } else {
            // User not authenticated, redirect to login with return URL
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', request.url);

            return NextResponse.redirect(loginUrl);
        }
    } catch (error) {
        console.error('SAML SSO Login Error:', error);
        return NextResponse.json({ error: 'SAML SSO login failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const samlRequest = body.get('SAMLRequest') as string;
        const relayState = body.get('RelayState') as string;
        const serviceProvider = 'aws'; // Default to AWS for now

        if (!samlRequest) {
            return NextResponse.json({ error: 'Missing SAMLRequest parameter' }, { status: 400 });
        }

        // Parse the SAML request
        const samlIdpService = SamlIdpService.getInstance();
        const requestInfo = await samlIdpService.processLoginRequest(samlRequest, serviceProvider);

        // Check if user is already authenticated
        const session = await getServerSession(authOptions);

        if (session?.user) {
            // User is authenticated, generate SAML response
            const samlResponse = await samlIdpService.initiateLogin(
                serviceProvider,
                (session.user as any).id,
                {
                    requestId: requestInfo.requestId,
                    relayState,
                }
            );

            // Create auto-submit form to redirect user to AWS
            const redirectForm = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Redirecting to AWS Console...</title>
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
                            border-top: 3px solid #3498db;
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
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="spinner"></div>
                        <h2>Redirecting to AWS Console...</h2>
                        <p>Please wait while we redirect you to the AWS Management Console.</p>
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
                        }, 1000);
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
        } else {
            // User not authenticated, redirect to login with return URL
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', request.url);

            return NextResponse.redirect(loginUrl);
        }
    } catch (error) {
        console.error('SAML SSO Login Error:', error);
        return NextResponse.json({ error: 'SAML SSO login failed' }, { status: 500 });
    }
}
