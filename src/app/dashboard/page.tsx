'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SideDrawer from '@/common/SideDrawer';
import CustomButton from '@/components/ui/customButton';

const DashboardPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (!session) {
            // Not authenticated, redirect to login
            router.push('/auth/login');
            return;
        }

        // Check if user is admin
        if (session.user && 'role' in session.user) {
            if (session.user.role !== 'admin') {
                // Not an admin, redirect to appropriate page
                if (session.user.role === 'user') {
                    router.push('/home');
                } else {
                    router.push('/auth/login');
                }
                return;
            }
        } else {
            // No role defined, redirect to login
            router.push('/auth/login');
            return;
        }
    }, [session, status, router]);

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!session || !session.user || !('role' in session.user) || session.user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                    <p className="text-gray-600 mb-8">
                        Welcome to the Data Loss Prevention Dashboard. Manage users, settings, and
                        integrations.
                    </p>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    User Management
                                </h3>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Manage user accounts, permissions, and access control.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.push('/admin/users')}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Manage Users
                                </button>
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Google Workspace
                                </h3>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Import users from your Google Workspace domain.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/google-workspace')}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Import Users
                            </button>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                    <svg
                                        className="w-6 h-6 text-white"
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
                                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Configure system settings and preferences.
                            </p>
                            <CustomButton
                                name="Open Settings"
                                btnType="button"
                                style="bg-purple-600 text-white w-full"
                                onClick={() => setIsDrawerOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* side drawer div it should inside root div */}
            <SideDrawer
                isOpen={isDrawerOpen}
                handleClose={handleDrawerClose}
                heading="Dashboard Settings"
                description="System configuration and settings."
                component={<div>Settings Content</div>}
                side="right"
            />
        </div>
    );
};

export default DashboardPage;
