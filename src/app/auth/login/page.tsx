'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user) {
            // Redirect based on user role
            if ('role' in session.user) {
                if (session.user.role === 'admin') {
                    router.push('/dashboard');
                } else if (session.user.role === 'user') {
                    router.push('/home');
                }
            }
        }
    }, [session, router]);

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to DLP Dashboard
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Choose your login type to access the dashboard
                    </p>
                </div>

                {/* Traditional Login Options */}
                <div className="space-y-4">
                    <Link
                        href="/auth/admin/login"
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Admin Login
                    </Link>

                    <Link
                        href="/auth/user/login"
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                            />
                        </svg>
                        User Login
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Admin Login</h3>
                        <p className="text-xs text-gray-500">
                            Google OAuth authentication for administrators
                        </p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">User Login</h3>
                        <p className="text-xs text-gray-500">
                            Passkey authentication or username/password for regular users
                        </p>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                    <p>Contact your administrator if you need access or support.</p>
                </div>
            </div>
        </div>
    );
}
