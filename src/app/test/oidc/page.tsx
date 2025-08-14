'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OIDCTestPage() {
    const searchParams = useSearchParams();
    const [testConfig, setTestConfig] = useState({
        clientId: 'test-client-123',
        redirectUri: '',
        scope: 'openid profile email',
        responseType: 'code',
        state: 'test-state-' + Math.random().toString(36).substr(2, 9),
    });
    const [authResult, setAuthResult] = useState<any>(null);
    const [tokenResult, setTokenResult] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Set redirect URI to current origin
        setTestConfig((prev) => ({
            ...prev,
            redirectUri: `${window.location.origin}/test/oidc/callback`,
        }));

        // Check if we're coming back from authorization
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (code || error) {
            setAuthResult({
                code,
                state,
                error,
                error_description: searchParams.get('error_description'),
            });
        }
    }, [searchParams]);

    const startAuthFlow = () => {
        const authUrl = new URL(`${window.location.origin}/api/oidc/auth`);
        authUrl.searchParams.set('client_id', testConfig.clientId);
        authUrl.searchParams.set('redirect_uri', testConfig.redirectUri);
        authUrl.searchParams.set('scope', testConfig.scope);
        authUrl.searchParams.set('response_type', testConfig.responseType);
        authUrl.searchParams.set('state', testConfig.state);

        window.location.href = authUrl.toString();
    };

    const exchangeToken = async () => {
        if (!authResult?.code) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('grant_type', 'authorization_code');
            formData.append('code', authResult.code);
            formData.append('redirect_uri', testConfig.redirectUri);
            formData.append('client_id', testConfig.clientId);
            formData.append('client_secret', 'test-secret'); // In production, this would be secure

            const response = await fetch('/api/oidc/token', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setTokenResult(result);
        } catch (error) {
            console.error('Token exchange failed:', error);
            setTokenResult({ error: 'Token exchange failed' });
        } finally {
            setLoading(false);
        }
    };

    const getUserInfo = async () => {
        if (!tokenResult?.access_token) return;

        setLoading(true);
        try {
            const response = await fetch('/api/oidc/userinfo', {
                headers: {
                    Authorization: `Bearer ${tokenResult.access_token}`,
                },
            });

            const result = await response.json();
            setUserInfo(result);
        } catch (error) {
            console.error('UserInfo request failed:', error);
            setUserInfo({ error: 'UserInfo request failed' });
        } finally {
            setLoading(false);
        }
    };

    const resetTest = () => {
        setAuthResult(null);
        setTokenResult(null);
        setUserInfo(null);
        setTestConfig((prev) => ({
            ...prev,
            state: 'test-state-' + Math.random().toString(36).substr(2, 9),
        }));
        window.history.replaceState({}, '', '/test/oidc');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">OIDC Flow Tester</h1>
                <p className="text-gray-600">Test the OpenID Connect authentication flow</p>
            </div>

            {/* Test Configuration */}
            <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client ID
                        </label>
                        <input
                            type="text"
                            value={testConfig.clientId}
                            onChange={(e) =>
                                setTestConfig((prev) => ({ ...prev, clientId: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Redirect URI
                        </label>
                        <input
                            type="url"
                            value={testConfig.redirectUri}
                            onChange={(e) =>
                                setTestConfig((prev) => ({ ...prev, redirectUri: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Scope
                        </label>
                        <input
                            type="text"
                            value={testConfig.scope}
                            onChange={(e) =>
                                setTestConfig((prev) => ({ ...prev, scope: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                        </label>
                        <input
                            type="text"
                            value={testConfig.state}
                            onChange={(e) =>
                                setTestConfig((prev) => ({ ...prev, state: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="mt-4 space-x-3">
                    <button
                        onClick={startAuthFlow}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        🚀 Start Authorization Flow
                    </button>
                    <button
                        onClick={resetTest}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        🔄 Reset Test
                    </button>
                </div>
            </div>

            {/* Step 1: Authorization Response */}
            {authResult && (
                <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Step 1: Authorization Response
                        {authResult.error ? (
                            <span className="ml-2 text-red-600">❌ Failed</span>
                        ) : (
                            <span className="ml-2 text-green-600">✅ Success</span>
                        )}
                    </h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                        {JSON.stringify(authResult, null, 2)}
                    </pre>
                    {authResult.code && !tokenResult && (
                        <button
                            onClick={exchangeToken}
                            disabled={loading}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? '⏳ Exchanging...' : '🔄 Exchange for Token'}
                        </button>
                    )}
                </div>
            )}

            {/* Step 2: Token Response */}
            {tokenResult && (
                <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Step 2: Token Response
                        {tokenResult.error ? (
                            <span className="ml-2 text-red-600">❌ Failed</span>
                        ) : (
                            <span className="ml-2 text-green-600">✅ Success</span>
                        )}
                    </h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                        {JSON.stringify(tokenResult, null, 2)}
                    </pre>
                    {tokenResult.access_token && !userInfo && (
                        <button
                            onClick={getUserInfo}
                            disabled={loading}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? '⏳ Fetching...' : '👤 Get User Info'}
                        </button>
                    )}
                </div>
            )}

            {/* Step 3: UserInfo Response */}
            {userInfo && (
                <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Step 3: UserInfo Response
                        {userInfo.error ? (
                            <span className="ml-2 text-red-600">❌ Failed</span>
                        ) : (
                            <span className="ml-2 text-green-600">✅ Success</span>
                        )}
                    </h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                        {JSON.stringify(userInfo, null, 2)}
                    </pre>
                </div>
            )}

            {/* Test Endpoints */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Available Test Endpoints</h2>
                <div className="space-y-2 text-sm">
                    <div>
                        <strong>Authorization Endpoint:</strong>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                            {window.location.origin}/api/oidc/auth
                        </code>
                    </div>
                    <div>
                        <strong>Token Endpoint:</strong>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                            {window.location.origin}/api/oidc/token
                        </code>
                    </div>
                    <div>
                        <strong>UserInfo Endpoint:</strong>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                            {window.location.origin}/api/oidc/userinfo
                        </code>
                    </div>
                    <div>
                        <strong>JWKS Endpoint:</strong>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                            {window.location.origin}/api/oidc/jwks
                        </code>
                    </div>
                    <div>
                        <strong>Discovery Document:</strong>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                            {window.location.origin}/.well-known/openid_configuration
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
}
