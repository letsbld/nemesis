'use client';

import dynamic from 'next/dynamic';

const DashboardPage = dynamic(() => import('./dashboard/DashboardView'), { ssr: false });

export default function PasswordManagerRootPage() {
    return <DashboardPage />;
}