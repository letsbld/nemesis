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
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the Data Loss Prevention Dashboard.</p>
            <CustomButton
                name="Open Drawer"
                btnType="button"
                style="bg-blue-500 text-white"
                onClick={() => setIsDrawerOpen(true)}
            />
            <SideDrawer
                isOpen={isDrawerOpen}
                handleClose={handleDrawerClose}
                heading="Side Drawer"
                description="This is a side drawer."
                component={<div>Drawer Content Right Side</div>}
                side="right"
            />
        </div>
    );
};

export default DashboardPage;
