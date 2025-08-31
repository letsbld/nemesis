'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

interface SessionWrapperProps {
    children: (user: any, status: string) => React.ReactNode;
}

const LoadingNav = () => (
    <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
        <div className="p-4 text-2xl font-bold">DLP Dashboard</div>
        <div className="p-4 text-gray-400">Loading...</div>
    </nav>
);

export function SessionWrapper({ children }: SessionWrapperProps) {
    const { user, status } = useAuth();

    return <ClientOnly fallback={<LoadingNav />}>{children(user, status)}</ClientOnly>;
}
