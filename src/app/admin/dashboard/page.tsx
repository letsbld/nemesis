'use client';

import React, { useState } from 'react';
import SideDrawer from '@/common/SideDrawer';
import { PrivateRoute } from '@/components/PrivateRoute';

const DashboardPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

    return (
        <PrivateRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                        <p className="text-gray-600 mb-8">
                            Welcome to the Data Loss Prevention Dashboard. Manage users, settings,
                            and integrations.
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
        </PrivateRoute>
    );
};

export default DashboardPage;
