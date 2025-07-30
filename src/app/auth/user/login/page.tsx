'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PasskeyAuth from '@/components/auth/PasskeyAuth';

export default function UserLoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        totpToken: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTOTP, setShowTOTP] = useState(false);
    const [totpRequired, setTotpRequired] = useState(false);
    const [passkeySuccess, setPasskeySuccess] = useState('');
    const [passkeyError, setPasskeyError] = useState('');

    useEffect(() => {
        if (session?.user) {
            // Redirect based on user role
            if ('role' in session.user) {
                if (session.user.role === 'admin') {
                    router.push('/dashboard');
                } else if (session.user.role === 'user') {
                    // Check if user needs to set up TOTP
                    const requiresTotpSetup =
                        'requiresTotpSetup' in session.user
                            ? session.user.requiresTotpSetup
                            : false;

                    if (requiresTotpSetup) {
                        // Redirect to TOTP setup with a query parameter to indicate it's required
                        router.push('/user/totp?required=true');
                    } else {
                        router.push('/home');
                    }
                }
            }
        }
    }, [session, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                username: formData.username,
                password: formData.password,
                totpToken: formData.totpToken,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === 'TOTP_REQUIRED') {
                    setTotpRequired(true);
                    setShowTOTP(true);
                    setError('Please enter your 6-digit authenticator code');
                } else if (result.error === 'INVALID_TOTP') {
                    setError('Invalid authenticator code. Please try again.');
                } else if (result.error === 'CredentialsSignin') {
                    // Check if this is a TOTP-related error
                    if (formData.totpToken) {
                        setError('Invalid authenticator code. Please try again.');
                    } else {
                        setError('Invalid username or password');
                    }
                } else {
                    setError('Invalid username or password');
                }
            } else if (result?.ok) {
                // Successful login, NextAuth will handle the redirect
                router.push('/home');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskeySuccess = (result: any) => {
        if (result.message) {
            setPasskeySuccess(result.message);
            setPasskeyError('');
        } else if (result.id) {
            // User authenticated successfully
            setPasskeySuccess('Authentication successful! Redirecting...');
            setPasskeyError('');
            // In a real implementation, you'd create a session here
            // For now, we'll just show success
            setTimeout(() => {
                router.push('/home');
            }, 1500);
        }
    };

    const handlePasskeyError = (errorMessage: string) => {
        setPasskeyError(errorMessage);
        setPasskeySuccess('');
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Login</h1>
                    <p className="text-gray-600 mb-8">Sign in with your passkey or username and password</p>
                </div>

                {/* Passkey Error/Success Messages */}
                {passkeyError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">{passkeyError}</p>
                    </div>
                )}

                {passkeySuccess && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700 text-sm">{passkeySuccess}</p>
                    </div>
                )}

                {/* Passkey Authentication */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        Passkey Authentication
                    </h2>
                    <PasskeyAuth onSuccess={handlePasskeySuccess} onError={handlePasskeyError} />
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Traditional Login Error Messages */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    {(showTOTP || totpRequired) && (
                        <div>
                            <label
                                htmlFor="totpToken"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                6-Digit Authenticator Code
                            </label>
                            <input
                                id="totpToken"
                                name="totpToken"
                                type="text"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                value={formData.totpToken}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="000000"
                                disabled={isLoading}
                                autoComplete="one-time-code"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter the 6-digit code from your authenticator app
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={
                            isLoading ||
                            !formData.username ||
                            !formData.password ||
                            (totpRequired && !formData.totpToken)
                        }
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Are you an administrator?</p>
                    <Link
                        href="/auth/admin/login"
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                        Admin Login →
                    </Link>
                </div>

                <div className="text-center text-sm text-gray-500">
                    <p>Your account is created by your administrator.</p>
                    <p className="mt-1">
                        Contact your administrator if you need access or forgot your password.
                    </p>
                </div>
            </div>
        </div>
    );
}
