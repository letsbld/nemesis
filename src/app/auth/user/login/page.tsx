'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from '@/lib/apiFetch';

interface DecodedToken {
    id: string;
    username: string;
    role?: string;
    exp?: number;
    requiresTotpSetup?: boolean;
}

export default function UserLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        totpToken: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 🔐 Auto-redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');

        if (token && userStr) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                if (decoded.exp && decoded.exp * 1000 > Date.now()) {
                    const user = JSON.parse(userStr);

                    if (user.role === 'admin') {
                        router.replace('/dashboard');
                    } else if (user.role === 'user') {
                        if (user.requiresTotpSetup) {
                            router.replace('/user/totp?required=true');
                        } else {
                            router.replace('/home');
                        }
                    }
                }
            } catch {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            }
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await apiFetch(`/auth/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    totpToken: formData.totpToken || '',
                }),
            });

            // ✅ Save token & user
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('authUser', JSON.stringify(result.user));

            // ✅ Redirect based on role
            if (result.user.role === 'admin') {
                router.replace('/dashboard');
            } else {
                router.replace('/home'); // or `/user/home`
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError('Invalid credentials or server error');
        }

        // try {
        //     const result = await apiFetch(`/auth/user/login`, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             username: formData.username,
        //             password: formData.password,
        //             totpToken: formData.totpToken || '',
        //         }),
        //     });

        //     // Save token + user
        //     localStorage.setItem('authToken', result.token);
        //     localStorage.setItem('authUser', JSON.stringify(result.user));

        //     // Redirect based on role
        //     if (result.user.role === 'admin') {
        //         router.push('/dashboard');
        //     } else if (result.user.role === 'user') {
        //         if (result.user.requiresTotpSetup) {
        //             router.push('/user/totp?required=true');
        //         } else {
        //             router.push('/home');
        //         }
        //     }
        // } catch (err: any) {
        //     console.error('Login failed:', err);
        //     const msg = err?.error || 'Invalid username, password, or TOTP code.';
        //     if (msg.includes('TOTP_REQUIRED')) {
        //         setShowTOTP(true);
        //         setError('Please enter your 6-digit authenticator code');
        //     } else if (msg.includes('INVALID_TOTP')) {
        //         setError('Invalid authenticator code. Please try again.');
        //     } else {
        //         setError(msg);
        //     }
        // } finally {
        //     setIsLoading(false);
        // }
    };

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

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !formData.username || !formData.password}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
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
            </div>
        </div>
    );
}
