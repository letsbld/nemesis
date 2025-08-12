import { NextRequest, NextResponse } from 'next/server';

// Simple Service Provider Simulator for testing
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'metadata';

    if (action === 'metadata') {
        // Return SP metadata for testing
        const spMetadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" 
                     entityID="http://localhost:3000/test-sp">
    <md:SPSSODescriptor AuthnRequestsSigned="false" 
                        WantAssertionsSigned="false" 
                        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
                                     Location="http://localhost:3000/api/test/sp-simulator?action=acs" 
                                     index="0" />
    </md:SPSSODescriptor>
</md:EntityDescriptor>`;

        return new NextResponse(spMetadata, {
            headers: { 'Content-Type': 'application/xml' }
        });
    }

    if (action === 'login') {
        // Generate SAML AuthnRequest
        const requestId = '_' + Math.random().toString(36).substring(2, 15);
        const samlRequest = `<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                    ID="${requestId}"
                    Version="2.0"
                    IssueInstant="${new Date().toISOString()}"
                    Destination="http://localhost:3000/api/saml/sso/login"
                    AssertionConsumerServiceURL="http://localhost:3000/api/test/sp-simulator?action=acs">
    <saml:Issuer>http://localhost:3000/test-sp</saml:Issuer>
    <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent" AllowCreate="true"/>
</samlp:AuthnRequest>`;

        const encodedRequest = Buffer.from(samlRequest).toString('base64');
        const ssoUrl = `http://localhost:3000/api/saml/sso/login?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=test-sp-login`;

        return NextResponse.redirect(ssoUrl);
    }

    if (action === 'acs') {
        // This would normally be POST, but for demo we'll handle GET
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test SP - Ready to Receive SAML Response</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .code { background: #f5f5f5; padding: 10px; font-family: monospace; border-radius: 3px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        .button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>🧪 Test Service Provider - ACS Endpoint</h1>
    
    <div class="info">
        <h3>This is the Assertion Consumer Service (ACS) endpoint</h3>
        <p>In a real application, this would:</p>
        <ul>
            <li>Receive POST data with SAMLResponse</li>
            <li>Validate the SAML assertion</li>
            <li>Extract user attributes</li>
            <li>Create application session</li>
        </ul>
    </div>

    <div class="success">
        <h4>✅ Service Provider Setup Complete</h4>
        <p>Your IdP can now send SAML responses to this endpoint.</p>
    </div>

    <h3>Test the complete flow:</h3>
    <a href="/api/test/sp-simulator?action=login" class="button">🚀 Start SAML Login Flow</a>
    <a href="/api/test/sp-simulator?action=metadata" class="button">📄 View SP Metadata</a>
    <a href="/test/saml" class="button">🧪 Built-in Test Page</a>

    <h3>Integration URLs:</h3>
    <div class="code">
        <strong>SP Entity ID:</strong> http://localhost:3000/test-sp<br>
        <strong>SP Metadata:</strong> http://localhost:3000/api/test/sp-simulator?action=metadata<br>
        <strong>ACS URL:</strong> http://localhost:3000/api/test/sp-simulator?action=acs<br>
        <strong>IdP Metadata:</strong> http://localhost:3000/api/saml/metadata
    </div>

    <h3>Manual Testing Steps:</h3>
    <ol>
        <li>Ensure you're logged into your DLP application</li>
        <li>Click "Start SAML Login Flow" above</li>
        <li>You should be redirected through the SSO process</li>
        <li>Check browser network tab to see SAML requests/responses</li>
    </ol>
</body>
</html>`;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // Default action - show simulator info
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>SAML Service Provider Simulator</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .action-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 20px; margin: 20px 0; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        .button:hover { background: #0056b3; }
        .code { background: #f5f5f5; padding: 10px; font-family: monospace; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🧪 SAML Service Provider Simulator</h1>
    <p>This tool simulates a Service Provider for testing your SAML IdP implementation.</p>

    <div class="action-card">
        <h3>📄 View SP Metadata</h3>
        <p>See the metadata that would be exchanged with your IdP</p>
        <a href="?action=metadata" class="button">View Metadata</a>
    </div>

    <div class="action-card">
        <h3>🚀 Test Login Flow</h3>
        <p>Start a SAML authentication request to your IdP</p>
        <a href="?action=login" class="button">Start Login</a>
    </div>

    <div class="action-card">
        <h3>📨 ACS Endpoint</h3>
        <p>The endpoint where SAML responses are received</p>
        <a href="?action=acs" class="button">View ACS Info</a>
    </div>

    <h3>Quick Start:</h3>
    <ol>
        <li>Make sure your SAML IdP is running on port 3000</li>
        <li>Ensure you have a user account in your system</li>
        <li>Click "Start Login" to test the complete flow</li>
    </ol>

    <div class="code">
        <strong>IdP Metadata URL:</strong> http://localhost:3000/api/saml/metadata
    </div>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'acs') {
        try {
            const formData = await request.formData();
            const samlResponse = formData.get('SAMLResponse') as string;
            const relayState = formData.get('RelayState') as string;

            if (!samlResponse) {
                return NextResponse.json({ error: 'No SAML response received' }, { status: 400 });
            }

            // Decode SAML response for display
            const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf-8');

            const html = `
<!DOCTYPE html>
<html>
<head>
    <title>SAML Response Received</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background: #e7f3ff; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .code { background: #f5f5f5; padding: 15px; font-family: monospace; border-radius: 3px; white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
    </style>
</head>
<body>
    <h1>✅ SAML Response Received Successfully!</h1>
    
    <div class="success">
        <h3>Authentication Successful</h3>
        <p>Your SAML IdP has successfully authenticated the user and sent a valid response.</p>
    </div>

    <div class="info">
        <h4>Response Details:</h4>
        <p><strong>Relay State:</strong> ${relayState || 'None'}</p>
        <p><strong>Response Size:</strong> ${samlResponse.length} characters (base64)</p>
        <p><strong>Decoded Size:</strong> ${decodedResponse.length} characters (XML)</p>
    </div>

    <h3>Decoded SAML Response:</h3>
    <div class="code">${decodedResponse.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

    <div style="margin-top: 30px;">
        <a href="/api/test/sp-simulator?action=login" class="button">🔄 Test Again</a>
        <a href="/test/saml" class="button">🧪 More Tests</a>
    </div>

    <h3>What happened:</h3>
    <ol>
        <li>Service Provider sent SAML AuthnRequest to IdP</li>
        <li>IdP authenticated the user (via your login system)</li>
        <li>IdP generated SAML assertion with user attributes</li>
        <li>IdP sent signed SAML response back to this ACS endpoint</li>
        <li>You can now extract user data and create application session</li>
    </ol>
</body>
</html>`;

            return new NextResponse(html, {
                headers: { 'Content-Type': 'text/html' }
            });

        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to process SAML response', details: (error as Error).message },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
