'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { getLogin, postAuthAccept } from './oidcApi';
import { loginWithPasskey } from '../components/user/passkey';

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
                // Log full error for debugging
                console.error('getLogin error:', e);
                // Expect 401 when auth is required
                if (e?.status !== 401) {
                    // Prefer structured error fields, fall back to full object so user can see details
                    setError(
                        e?.data?.error ||
                            e?.error ||
                            e?.message ||
                            JSON.stringify(e) ||
                            'Login failed'
                    );
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
            console.error('postAuthAccept error:', e);
            const errCode = e?.data?.error || e?.error || e?.message;
            if (errCode === 'TOTP_REQUIRED' || e?.data?.error === 'TOTP_REQUIRED') {
                setTotpRequired(true);
                setError('TOTP code required');
            } else if (errCode === 'INVALID_TOTP' || e?.data?.error === 'INVALID_TOTP') {
                setError('Invalid TOTP code');
            } else if (e?.status === 401) {
                setError('Invalid credentials');
            } else {
                setError(errCode || JSON.stringify(e) || 'Login failed');
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function onPasskey(e?: React.MouseEvent) {
        if (e) e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (!username) {
                setError('Enter username for passkey login');
                return;
            }
            const resp = await loginWithPasskey(username);
            // If backend returned a token, store it for subsequent calls
            if (resp && resp.token) {
                try {
                    localStorage.setItem('authToken', resp.token);
                } catch {}
            }

            // If backend directly returned a redirect URL, navigate there
            if (resp && (resp.redirect_to || resp.url)) {
                const to = resp.redirect_to || resp.url;
                window.location.assign(to);
                return;
            }

            // Otherwise, try the standard getLogin flow which should now succeed with the session/token set
            const data = await getLogin(login_challenge, true);
            if (data?.redirect_to) {
                window.location.assign(data.redirect_to);
                return;
            }
            setError('Passkey login succeeded but no redirect returned');
        } catch (err: any) {
            console.error('passkey login error:', err);
            setError(err?.data?.error || err?.message || String(err) || 'Passkey login failed');
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
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                    <button
                        type="button"
                        onClick={onPasskey}
                        disabled={submitting}
                        style={{ padding: '6px 10px', borderRadius: 6 }}
                    >
                        Sign in with passkey
                    </button>
                </div>
            </form>
        </div>
    );
}
