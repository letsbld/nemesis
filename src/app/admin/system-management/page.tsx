'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DashboardView = dynamic(() => import('./DashboardView'), { 
    ssr: false 
});

export default function SystemManagementPage() {
    return <DashboardView />;
}