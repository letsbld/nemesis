'use client';

import React, { useMemo, useState } from 'react';
import { getOidcHealth, startTestAuth } from '../../oidc/oidcApi';

export default function Page() {
    const [health, setHealth] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Do not inject a hard-coded default client id. Start empty unless an env var is provided.
    const [clientId, setClientId] = useState(process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? '');
    const [redirectUri, setRedirectUri] = useState(process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI ?? '');
    const [scope, setScope] = useState('openid offline');

    const authHint = useMemo(
        () => 'This uses your JWT from localStorage (authToken or token) as Authorization: Bearer.',
        []
    );

    async function onHealth() {
        setError('');
        setHealth('');
        try {
            const data = await getOidcHealth();
            setHealth(JSON.stringify(data, null, 2));
        } catch (e: any) {
            setError(e?.data?.error || e?.message || 'Health failed');
        }
    }

    function onStart() {
        setError('');
        // Full page redirect to backend test/start (backend will redirect to Hydra)
        startTestAuth({ client_id: clientId, redirect_uri: redirectUri, scope });
    }

    return (
        <div className="max-w-[720px] p-4">
            <h3 className="text-lg font-semibold mb-2">OIDC Tester</h3>
            <div className="text-sm text-gray-600 mb-3">{authHint}</div>

            <div className="grid gap-2 grid-cols-2">
                <label style={{ display: 'grid', gap: 4 }}>
                    <span className="text-sm font-medium text-gray-700">Client ID</span>
                    <input
                        placeholder="Enter your client id"
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                    />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                    <span className="text-sm font-medium text-gray-700">Redirect URI</span>
                    <input
                        placeholder="Enter your redirect uri"
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={redirectUri}
                        onChange={(e) => setRedirectUri(e.target.value)}
                    />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                    <span className="text-sm font-medium text-gray-700">Scope</span>
                    <input
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                    />
                </label>
            </div>

            <div className="flex gap-2 mt-3">
                <button
                    onClick={onHealth}
                    className="bg-teal-500 text-white px-3 py-2 rounded-md hover:bg-teal-600"
                >
                    Call /oidc/health
                </button>
                <button
                    onClick={onStart}
                    className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                >
                    Start OIDC Test Auth
                </button>
            </div>

            {error ? <div className="text-red-600 mt-3">{error}</div> : null}
            {health ? <pre className="mt-3 bg-gray-100 p-3 rounded">{health}</pre> : null}
        </div>
    );
}
