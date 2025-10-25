'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { getLogin, postAuthAccept } from './oidcApi';

/*
How this page is called:
1) The OIDC client starts auth by sending the browser to:
   HYDRA_PUBLIC_URL/oauth2/auth?client_id=...&redirect_uri=...&response_type=code&scope=...&state=...
2) Hydra redirects the browser to your "login app" URL configured in Hydra, e.g.:
   https://<your-frontend>/oidc/login?login_challenge=XYZ
3) This component reads login_challenge from the URL, calls your backend:
   - GET /oidc/login?login_challenge=XYZ (with user JWT if present) to auto-accept
   - If 401, shows the form and POSTs /oidc/auth/accept to authenticate+accept
4) On success, it sets window.location = redirect_to (Hydra's login accept URL), continuing the flow.
Ensure your router maps path "/oidc/login" to this component.
*/

function useQueryParam(name: string) {
    return useMemo(() => {
        if (typeof window === 'undefined') return '';
        return new URLSearchParams(window.location.search).get(name) || '';
    }, [name]);
}

export default function OidcLogin() {
    const login_challenge = useQueryParam('login_challenge');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totpToken, setTotpToken] = useState('');
    const [totpRequired, setTotpRequired] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            if (!login_challenge) {
                setError('Missing login_challenge');
                setLoading(false);
                return;
            }
            try {
                // Try auto-accept with existing JWT
                const data = await getLogin(login_challenge, true);
                if (data?.redirect_to && !cancelled) {
                    // Immediate redirect, no delay
                    window.location.assign(data.redirect_to);
                    return;
                }
            } catch (e: any) {
                // Expect 401 when auth is required
                if (e?.status !== 401) {
                    setError(e?.data?.error || e?.message || 'Login failed');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        run();
        return () => {
            cancelled = true;
        };
    }, [login_challenge]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload: any = { login_challenge, username, password };
            if (totpRequired && totpToken) payload.totpToken = totpToken;
            const data = await postAuthAccept(payload);
            if (data?.redirect_to) {
                // Immediate redirect, no delay
                window.location.assign(data.redirect_to);
                return;
            }
            setError('Missing redirect_to');
        } catch (e: any) {
            if (e?.data?.error === 'TOTP_REQUIRED') {
                setTotpRequired(true);
                setError('TOTP code required');
            } else if (e?.data?.error === 'INVALID_TOTP') {
                setError('Invalid TOTP code');
            } else if (e?.status === 401) {
                setError('Invalid credentials');
            } else {
                setError(e?.data?.error || e?.message || 'Login failed');
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div>Authorizing...</div>;

    return (
        <div style={{ maxWidth: 360 }}>
            <h3>Sign in</h3>
            {error ? <div style={{ color: 'red' }}>{error}</div> : null}
            <form onSubmit={onSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>
                {totpRequired && (
                    <div>
                        <label>TOTP</label>
                        <input
                            inputMode="numeric"
                            pattern="\d*"
                            value={totpToken}
                            onChange={(e) => setTotpToken(e.target.value)}
                            placeholder="123456"
                        />
                    </div>
                )}
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}
