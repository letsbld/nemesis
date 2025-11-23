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
                setError('Enter email for passkey login');
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="text-lg font-medium text-gray-700">Authorizing...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">Welcome Back</h3>
                            <p className="text-indigo-100">Sign in to your account</p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="px-8 py-6">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-red-500 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-red-800 text-sm font-medium">
                                        {error}
                                    </span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-500 bg-white"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-500 bg-white"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {totpRequired && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        TOTP Code
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        value={totpToken}
                                        onChange={(e) => setTotpToken(e.target.value)}
                                        placeholder="123456"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-500 bg-white text-center tracking-widest font-mono"
                                        maxLength={6}
                                    />
                                    <p className="text-xs text-gray-600 mt-2">
                                        Enter the 6-digit code from your authenticator app
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Sign in'
                                    )}
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onPasskey}
                                    disabled={submitting}
                                    className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 disabled:border-gray-300 transition duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Sign in with passkey</span>
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-center text-xs text-gray-600">
                            Secure login powered by DLP Security
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
