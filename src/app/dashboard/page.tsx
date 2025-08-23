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
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Only redirect if session loading is complete and we're not already redirecting
        if (status === 'loading' || isRedirecting) return;

        if (!session?.user) {
            setIsRedirecting(true);
            router.push('/auth/login');
            return;
        }

        // Check if user has role property and is admin
        const userRole = (session.user as any)?.role;
        if (!userRole) {
            setIsRedirecting(true);
            router.push('/auth/login');
            return;
        }

        if (userRole !== 'admin') {
            setIsRedirecting(true);
            if (userRole === 'user') {
                router.push('/home');
            } else {
                router.push('/auth/login');
            }
            return;
        }
    }, [session, status, router, isRedirecting]);

    // Show loading while session is loading or redirecting
    if (status === 'loading' || isRedirecting) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Don't render dashboard if no session or not admin
    if (!session?.user || (session.user as any)?.role !== 'admin') {
        return null; // Will redirect in useEffect
    }

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                    <p className="text-gray-600 mb-8">
                        Welcome to the Data Loss Prevention Dashboard. Manage users, settings, and
                        integrations.
                    </p>

                    {/* Rest of your dashboard content */}
                </div>
            </div>

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
