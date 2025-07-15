'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SideNavBar } from '../../components/dashboard/SideNavBar';

export default function RoomPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (!session) {
            router.push('/auth/login');
            return;
        }

        // Check if user has a valid role
        const userRole = (session.user as any)?.role;
        if (!userRole || (userRole !== 'admin' && userRole !== 'user')) {
            router.push('/auth/login');
            return;
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="flex h-screen">
                <SideNavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    if (!session) {
        return null; // Will redirect in useEffect
    }

    const userRole = (session.user as any)?.role;
    const userName = session.user?.name || session.user?.email || 'User';
    const isAdmin = userRole === 'admin';

    return (
        <div className="flex h-screen">
            <SideNavBar />
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Welcome to the DLP Dashboard
                        </h1>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 rounded-full p-3 mr-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {isAdmin ? 'Administrator' : 'User'} Dashboard
                                    </h2>
                                    <p className="text-gray-600">
                                        Logged in as: {userName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isAdmin ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    User Management
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Manage users and user groups in the system.
                                </p>
                                <div className="space-y-2">
                                    <a 
                                        href="/admin/users" 
                                        className="block text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        → Manage Users
                                    </a>
                                    <a 
                                        href="/admin/user-groups" 
                                        className="block text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        → Manage User Groups
                                    </a>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    System Overview
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Monitor system status and view reports.
                                </p>
                                <div className="space-y-2">
                                    <a 
                                        href="/dashboard" 
                                        className="block text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        → View Dashboard
                                    </a>
                                    <a 
                                        href="/device" 
                                        className="block text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        → Device Management
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    My Profile
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    View and manage your profile information.
                                </p>
                                <a 
                                    href="/user/profile" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    → View Profile
                                </a>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Applications
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    View your applications and reports.
                                </p>
                                <a 
                                    href="/user/report" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    → View Applications
                                </a>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Settings
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Configure your account settings and preferences.
                                </p>
                                <a 
                                    href="/user/settings" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    → Account Settings
                                </a>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Home
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Access your home dashboard and overview.
                                </p>
                                <a 
                                    href="/home" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    → Go to Home
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Data Loss Prevention Dashboard
                        </h3>
                        <p className="text-gray-600">
                            This is your central hub for managing data loss prevention policies, 
                            monitoring system activity, and ensuring compliance with security protocols.
                            {isAdmin 
                                ? ' As an administrator, you have full access to all system features and user management capabilities.'
                                : ' Use the navigation menu to access your available features and settings.'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
