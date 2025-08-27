'use client';

import { useState, useEffect } from 'react';
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

    // Check if user already logged in
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('authUser');
        if (token && user) {
            const parsedUser = JSON.parse(user);

            if (oidcRequest) return; // handle OIDC separately

            if (parsedUser.role === 'admin') {
                router.push('/dashboard');
            } else if (parsedUser.role === 'user') {
                router.push('/home');
            } else {
                router.push(callbackUrl);
            }
        }
    }, [router, callbackUrl, oidcRequest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!res.ok) {
                setError('Invalid credentials');
                return;
            }

            const data = await res.json(); // { token, user }

            // Store JWT + user in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));

            if (oidcRequest) {
                const params = new URLSearchParams(window.location.search);
                params.delete('oidc_request');
                window.location.href = `/api/oidc/auth?${params.toString()}`;
            } else {
                router.push('/home');
                // if (data.user.role === 'admin') {
                //     router.push('/dashboard');
                // } else if (data.user.role === 'user') {
                //     router.push('/home');
                // } else {
                //     router.push(callbackUrl);
                // }
            }
        } catch (err) {
            console.error('Login error:', err);
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
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* <div className="rounded-md shadow-sm -space-y-px">
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
                    </div> */}

                    {/* <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
