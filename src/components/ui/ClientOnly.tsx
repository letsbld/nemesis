'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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
    children: (session: any, status: string) => React.ReactNode;
}

const LoadingNav = () => (
    <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
        <div className="p-4 text-2xl font-bold">DLP Dashboard</div>
        <div className="p-4 text-gray-400">Loading...</div>
    </nav>
);

export function SessionWrapper({ children }: SessionWrapperProps) {
    const { data: session, status } = useSession();

    return <ClientOnly fallback={<LoadingNav />}>{children(session, status)}</ClientOnly>;
}
