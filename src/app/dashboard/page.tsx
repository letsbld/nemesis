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
        <div className="flex flex-col items-center justify-center h-screen bg-center bg-cover bg-no-repeat bg-fixed bg-gradient-to-r from-blue-500 to-green-500">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg mb-4">Welcome to the Data Loss Prevention Dashboard.</p>
            <CustomButton
                name="Open Drawer"
                btnType="button"
                style="bg-blue-500 text-white"
                onClick={() => setIsDrawerOpen(true)}
            />

            {/* side drawer div it should inside root div */}
            <SideDrawer
                isOpen={isDrawerOpen}
                handleClose={handleDrawerClose}
                heading="Dashboard side draweer"
                description="This is a side drawer."
                component={<div>Drawer Content Right Side</div>}
                side="right"
            />
        </div>
    );
};

export default DashboardPage;
