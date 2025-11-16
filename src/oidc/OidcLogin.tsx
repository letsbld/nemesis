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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 text-gray-700 text-lg">Authorizing...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Sign in</h3>
                    <p className="text-gray-600">Enter your credentials to continue</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    {totpRequired && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                TOTP Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                value={totpToken}
                                onChange={(e) => setTotpToken(e.target.value)}
                                placeholder="123456"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Signing in...' : 'Sign in'}
                        </button>

                        <button
                            type="button"
                            onClick={onPasskey}
                            disabled={submitting}
                            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sign in with passkey
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
