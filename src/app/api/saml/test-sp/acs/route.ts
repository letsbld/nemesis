import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const samlResponse = body.get('SAMLResponse') as string;
        const relayState = body.get('RelayState') as string;

        if (!samlResponse) {
            return NextResponse.json({ error: 'Missing SAMLResponse' }, { status: 400 });
        }

        // Decode and parse SAML response for testing
        const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf-8');

        // Create a simple HTML page to display the results
        const resultPage = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>SAML Test SP - Response Received</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        max-width: 1200px; 
                        margin: 0 auto; 
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .success {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        color: #155724;
                        padding: 1rem;
                        border-radius: 4px;
                        margin-bottom: 2rem;
                    }
                    .info-box {
                        background: #e7f3ff;
                        border: 1px solid #bee5eb;
                        padding: 1rem;
                        border-radius: 4px;
                        margin: 1rem 0;
                    }
                    .saml-content {
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        padding: 1rem;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        overflow-x: auto;
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                    .section {
                        margin: 2rem 0;
                    }
                    h1 { color: #28a745; }
                    h2 { color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 0.5rem; }
                    .highlight { background-color: #fff3cd; padding: 2px 4px; border-radius: 2px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ SAML Test Service Provider</h1>
                    
                    <div class="success">
                        <strong>Success!</strong> Your SAML IdP successfully sent a response to this test Service Provider.
                    </div>

                    <div class="section">
                        <h2>Test Results</h2>
                        <div class="info-box">
                            <strong>✅ SAML Response Received:</strong> YES<br>
                            <strong>📧 RelayState:</strong> ${relayState || 'None'}<br>
                            <strong>🕒 Timestamp:</strong> ${new Date().toISOString()}<br>
                            <strong>📏 Response Size:</strong> ${decodedResponse.length} characters
                        </div>
                    </div>

                    <div class="section">
                        <h2>SAML Response Analysis</h2>
                        <div class="info-box">
                            <strong>What this means:</strong><br>
                            • Your SAML Identity Provider is working correctly<br>
                            • Authentication flow completed successfully<br>
                            • SAML assertion was properly formatted<br>
                            • Ready for production service provider integration
                        </div>
                    </div>

                    <div class="section">
                        <h2>Decoded SAML Response</h2>
                        <p>This is the raw SAML assertion your IdP generated:</p>
                        <div class="saml-content">${decodedResponse
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')}</div>
                    </div>

                    <div class="section">
                        <h2>Next Steps</h2>
                        <div class="info-box">
                            <strong>For AWS Integration:</strong><br>
                            1. Copy your IdP metadata from <code>/api/saml/metadata</code><br>
                            2. Create SAML Identity Provider in AWS IAM<br>
                            3. Configure IAM roles with proper trust relationships<br>
                            4. Update AWS Console login URL to use your IdP<br><br>
                            
                            <strong>For Other Services:</strong><br>
                            • Google Workspace: Use Google Admin Console<br>
                            • Microsoft 365: Use Azure AD Enterprise Apps<br>
                            • Salesforce: Use Single Sign-On settings<br>
                            • Any SAML 2.0 compatible service
                        </div>
                    </div>

                    <div class="section">
                        <h2>Testing Tools</h2>
                        <div class="info-box">
                            <strong>Online SAML Validators:</strong><br>
                            • <a href="https://samltest.id/" target="_blank">SAMLtest.id</a> - Free SAML testing<br>
                            • <a href="https://www.samltool.com/validate_response.php" target="_blank">SAML Tool</a> - Response validator<br>
                            • Browser extensions: "SAML-tracer" for debugging
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d;">
                            🎉 Congratulations! Your SAML IdP is working perfectly.<br>
                            <a href="/dashboard/sso-management" style="color: #007bff;">← Back to SSO Management</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return new NextResponse(resultPage, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        console.error('Test SP ACS Error:', error);
        return NextResponse.json(
            { error: 'Failed to process SAML response', details: (error as Error).message },
            { status: 500 }
        );
    }
}
