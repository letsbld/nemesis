'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserHomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (!session) {
            // Not authenticated, redirect to login
            router.push('/auth/login');
            return;
        }

        // Check if user has the right role
        if (session.user && 'role' in session.user) {
            if (session.user.role === 'admin') {
                // Admin should go to dashboard instead
                router.push('/dashboard');
                return;
            }
            if (session.user.role !== 'user') {
                // Unknown role, redirect to login
                router.push('/auth/login');
                return;
            }
        } else {
            // No role defined, redirect to login
            router.push('/auth/login');
            return;
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!session || !session.user || !('role' in session.user) || session.user.role !== 'user') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    const user = session.user;
    const displayName = 'displayName' in user ? String(user.displayName) : user.name || '';
    const username = 'username' in user ? String(user.username) : '';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to the DLP Dashboard
                    </h1>
                    <p className="text-xl text-gray-600">
                        Hello, {displayName || user.name || 'User'}!
                    </p>
                    {username && <p className="text-sm text-gray-500 mt-1">Username: {username}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Data Protection</h3>
                        </div>
                        <p className="text-gray-700">
                            Your data is being monitored and protected by our advanced DLP systems.
                        </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                        </div>
                        <p className="text-gray-700">
                            View your recent activity and data access logs for transparency.
                        </p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Security Tips</h3>
                        </div>
                        <p className="text-gray-700">
                            Learn about best practices for data security and compliance.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="text-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-blue-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45.5a2.5 2.5 0 11-3.9 0 .5.5 0 01.9 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Profile</span>
                            </div>
                        </button>

                        <button className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="text-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-green-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Logs</span>
                            </div>
                        </button>

                        <button className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="text-center">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-yellow-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 100-2 1 1 0 000 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Reports</span>
                            </div>
                        </button>

                        <button className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="text-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-purple-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Settings</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        For additional support or questions, please contact your system
                        administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
