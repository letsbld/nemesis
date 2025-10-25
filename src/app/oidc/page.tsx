'use client';

import React, { useMemo, useState } from 'react';
import { getOidcHealth, startTestAuth } from '../../oidc/oidcApi';

export default function Page() {
    const [health, setHealth] = useState<string>('');
    const [error, setError] = useState<string>('');

    const defaultClientId =
        process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || '6a6210ad-3f6b-4b7e-92ef-ecafb6877784';
    const defaultRedirectUri =
        process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI || 'http://localhost:3030/oauth2/callback';

    const [clientId, setClientId] = useState(defaultClientId);
    const [redirectUri, setRedirectUri] = useState(defaultRedirectUri);
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
        <div style={{ maxWidth: 720, padding: 16 }}>
            <h3>OIDC Tester</h3>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>{authHint}</div>

            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
                <label style={{ display: 'grid', gap: 4 }}>
                    <span>Client ID</span>
                    <input value={clientId} onChange={(e) => setClientId(e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                    <span>Redirect URI</span>
                    <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                    <span>Scope</span>
                    <input value={scope} onChange={(e) => setScope(e.target.value)} />
                </label>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={onHealth}>Call /oidc/health</button>
                <button onClick={onStart}>Start OIDC Test Auth</button>
            </div>

            {error ? <div style={{ color: 'red', marginTop: 12 }}>{error}</div> : null}
            {health ? (
                <pre style={{ marginTop: 12, background: '#f5f5f5', padding: 12 }}>{health}</pre>
            ) : null}
        </div>
    );
}
