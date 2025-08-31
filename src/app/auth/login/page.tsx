'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginPageContent() {
    const [error, setError] = useState('');
    // Add missing state for credentials and loading if you want to enable the login form
    // const [credentials, setCredentials] = useState({ username: '', password: '' });
    // const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const oidcRequest = searchParams.get('oidc_request');

    // Check if user already logged in s
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('authUser');
        console.log('[AUTH LOGIN] localStorage.authToken:', token);
        console.log('[AUTH LOGIN] localStorage.authUser:', user);

        if (token && user) {
            let parsedUser;
            try {
                parsedUser = JSON.parse(user);
            } catch (e) {
                console.log('[AUTH LOGIN] Error parsing user:', e);
                return;
            }

            if (oidcRequest) return; // handle OIDC separately

            console.log('[AUTH LOGIN] Parsed user:', parsedUser);
            if (parsedUser.role === 'admin') {
                console.log('[AUTH LOGIN] Admin user detected, redirecting');
                router.push('/dashboard');
            } else if (parsedUser.role === 'user') {
                console.log('[AUTH LOGIN] User detected, redirecting');
                router.push('/home');
            } else {
                console.log('[AUTH LOGIN] Unknown role, redirecting to callbackUrl');
                router.push(callbackUrl);
            }
        }
    }, [router, callbackUrl, oidcRequest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // const res = await fetch('/api/auth/login', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(credential),
            // });

            // if (!res.ok) {
            //     setError('Invalid credentials');
            //     return;
            // }

            // const data = await res.json(); // { token, user }

            // // Store JWT + user in localStorage
            // localStorage.setItem('authToken', data.token);
            // localStorage.setItem('authUser', JSON.stringify(data.user));
            // document.cookie = `authToken=${data.token}; path=/;`;

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

                    {/* Login form fields are commented out.
                        Uncomment and add missing state if you want to enable the login form.
                    */}

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

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}