'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const RemoteAccessDashboard = dynamic(() => import('./DashboardView'), { 
    ssr: false 
});

export default function RemoteAccessPage() {
    return <RemoteAccessDashboard />;
}