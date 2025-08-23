'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const oidcRequest = searchParams.get('oidc_request');

    useEffect(() => {
        const checkSession = async () => {
            const session = await getSession();
            if (session?.user) {
                // If there's an OIDC request, continue with OIDC flow
                if (oidcRequest) {
                    return;
                }

                // Redirect based on user role
                const userRole = (session.user as any).role;
                if (userRole === 'admin') {
                    router.push('/dashboard');
                } else if (userRole === 'user') {
                    router.push('/home');
                } else {
                    router.push(callbackUrl);
                }
            }
        };

        checkSession();
    }, [router, callbackUrl, oidcRequest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                username: credentials.username,
                password: credentials.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials');
            } else {
                // Get the session to determine redirect
                const session = await getSession();

                // If there's an OIDC request, redirect back to the auth endpoint
                if (oidcRequest) {
                    // Remove oidc_request from params and redirect to OIDC auth
                    const params = new URLSearchParams(window.location.search);
                    params.delete('oidc_request');
                    window.location.href = `/api/oidc/auth?${params.toString()}`;
                } else {
                    // Normal login redirect based on role
                    const userRole = (session?.user as any)?.role;
                    if (userRole === 'admin') {
                        router.push('/dashboard');
                    } else if (userRole === 'user') {
                        router.push('/home');
                    } else {
                        router.push(callbackUrl);
                    }
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to DLP Dashboard
                    </h2>
                    {oidcRequest && (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Authentication required for service provider access
                        </p>
                    )}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                value={credentials.username}
                                onChange={(e) =>
                                    setCredentials((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div> */}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                href="/auth/admin/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Admin Login →
                            </Link>
                        </div>
                        <div className="text-sm">
                            <Link
                                href="/auth/user/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                User Login →
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
