'use client';

import React, { useState } from 'react';
import SideDrawer from '@/common/SideDrawer';
import CustomButton from '@/components/ui/customButton';

const DashboardPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

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
