'use client';

import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
            console.log('=== USER LOGIN ATTEMPT ===');
            console.log('Username:', formData.username);
            console.log('Password length:', formData.password.length);
            console.log('TOTP token provided:', !!formData.totpToken);

            const result = await signIn('credentials', {
                username: formData.username,
                password: formData.password,
                totpToken: formData.totpToken || '',
                redirect: false,
            });

            console.log('=== LOGIN RESPONSE ===');
            console.log('Full result:', JSON.stringify(result, null, 2));

            if (result?.error) {
                console.log('=== HANDLING LOGIN ERROR ===');
                console.log('Error type:', result.error);

                // Check for specific TOTP errors in the error message
                if (result.error.includes('TOTP_REQUIRED')) {
                    console.log('TOTP is required for this user');
                    setShowTOTP(true);
                    setError('Please enter your 6-digit authenticator code');
                } else if (result.error.includes('INVALID_TOTP')) {
                    console.log('Invalid TOTP code provided');
                    setError('Invalid authenticator code. Please try again.');
                } else if (result.error === 'CredentialsSignin') {
                    console.log('General credentials error');
                    if (!showTOTP) {
                        setShowTOTP(true);
                        setError(
                            'Login failed. If you have 2FA enabled, please enter your code below.'
                        );
                    } else {
                        setError('Invalid username, password, or authenticator code.');
                    }
                } else {
                    setError('Invalid username or password');
                }
            } else if (result?.ok) {
                console.log('=== LOGIN SUCCESS ===');
                // Let useEffect handle redirect based on session
            }
        } catch (error) {
            console.error('=== LOGIN EXCEPTION ===');
            console.error('Exception details:', error);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
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
                    <p className="text-gray-600 mb-8">Sign in with your username and password</p>
                </div>

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

                    {showTOTP && (
                        <div>
                            <label
                                htmlFor="totpToken"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                6-Digit Authenticator Code (if enabled)
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
                                Leave blank if you don't have 2FA enabled
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !formData.username || !formData.password}
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
