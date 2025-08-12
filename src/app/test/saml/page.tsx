'use client';

import { useState } from 'react';

export default function SAMLTestPage() {
    const [testResult, setTestResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        setTestResult('');

        try {
            // Create a SAML AuthnRequest
            const samlRequest = `
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                    ID="_${Math.random().toString(36).substring(2, 15)}"
                    Version="2.0"
                    IssueInstant="${new Date().toISOString()}"
                    Destination="${window.location.origin}/api/saml/sso/protected-login"
                    AssertionConsumerServiceURL="${window.location.origin}/api/saml/test-sp/acs">
    <saml:Issuer>${window.location.origin}/test-sp</saml:Issuer>
    <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>`;

            // Encode the request
            const encodedRequest = btoa(samlRequest);

            // Redirect to IdP
            const idpUrl = `${
                window.location.origin
            }/api/saml/sso/protected-login?SAMLRequest=${encodeURIComponent(
                encodedRequest
            )}&RelayState=test`;

            window.location.href = idpUrl;
        } catch (error) {
            console.error('Test failed:', error);
            setTestResult(`Test failed: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const testMetadata = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/saml/metadata');
            const metadata = await response.text();

            // Open in new window to view metadata
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head><title>SAML IdP Metadata</title></head>
                        <body>
                            <h1>SAML Identity Provider Metadata</h1>
                            <pre style="background: #f5f5f5; padding: 20px; white-space: pre-wrap;">${metadata
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')}</pre>
                        </body>
                    </html>
                `);
            }
        } catch (error) {
            setTestResult(`Metadata test failed: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    🧪 SAML Identity Provider Testing
                </h1>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Test Your SAML IdP</h2>
                    <p className="text-blue-800 mb-4">
                        This page helps you test your SAML Identity Provider by simulating a Service
                        Provider request. Click the test button below to initiate a full SAML
                        authentication flow.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Quick Tests */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Quick Tests</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded">
                                <div>
                                    <h4 className="font-medium">Metadata Test</h4>
                                    <p className="text-sm text-gray-600">
                                        Verify IdP metadata is accessible
                                    </p>
                                </div>
                                <button
                                    onClick={testMetadata}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Testing...' : 'Test Metadata'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded">
                                <div>
                                    <h4 className="font-medium">Full Authentication Flow</h4>
                                    <p className="text-sm text-gray-600">
                                        Complete SAML authentication test
                                    </p>
                                </div>
                                <button
                                    onClick={runTest}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Testing...' : 'Start Test'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* External Testing Tools */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">External Testing Tools</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border rounded p-4">
                                <h4 className="font-medium text-green-700">
                                    SAMLtest.id (Recommended)
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Free SAML testing service. Upload your metadata and test
                                    authentication.
                                </p>
                                <a
                                    href="https://samltest.id/upload.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    Open SAMLtest.id →
                                </a>
                            </div>

                            <div className="border rounded p-4">
                                <h4 className="font-medium text-purple-700">SAML Tool Validator</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Validate SAML responses and debug issues.
                                </p>
                                <a
                                    href="https://www.samltool.com/validate_response.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    Open SAML Tool →
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Configuration URLs */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Configuration URLs</h3>
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                                <strong>IdP Metadata:</strong>
                                <br />
                                <code>{window.location.origin}/api/saml/metadata</code>
                            </div>
                            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                                <strong>SSO Login URL:</strong>
                                <br />
                                <code>{window.location.origin}/api/saml/sso/protected-login</code>
                            </div>
                            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                                <strong>Test SP ACS URL:</strong>
                                <br />
                                <code>{window.location.origin}/api/saml/test-sp/acs</code>
                            </div>
                        </div>
                    </div>

                    {/* AWS Setup Instructions */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">AWS SAML Setup</h3>
                        <div className="prose text-sm">
                            <ol className="list-decimal list-inside space-y-2">
                                <li>
                                    Download metadata from: <code>/api/saml/metadata</code>
                                </li>
                                <li>Go to AWS IAM → Identity Providers → Create Provider</li>
                                <li>Choose SAML and upload the metadata file</li>
                                <li>Create IAM roles with SAML trust relationship</li>
                                <li>Update AWS login URL to use your IdP</li>
                            </ol>
                        </div>
                    </div>

                    {/* Debug Information */}
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                            <h4 className="font-medium text-yellow-800 mb-2">
                                Browser Extensions for SAML Debugging:
                            </h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Install `&quot;`SAML-tracer`&quot;` for Chrome/Firefox</li>
                                <li>• Monitor SAML requests and responses in real-time</li>
                                <li>• Validate assertion signatures and attributes</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {testResult && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                        <h4 className="font-medium text-red-800">Test Result:</h4>
                        <pre className="text-sm text-red-700 mt-2 whitespace-pre-wrap">
                            {testResult}
                        </pre>
                    </div>
                )}

                <div className="text-center mt-8">
                    <a href="/dashboard/sso-management" className="text-blue-600 hover:underline">
                        ← Back to SSO Management
                    </a>
                </div>
            </div>
        </div>
    );
}
