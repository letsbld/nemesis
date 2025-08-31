import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PrivateRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // e.g. ['admin'], ['user'], ['admin', 'user']
    redirectTo?: string; // default: '/auth/login'
    checkTotp?: boolean; // for user role, redirect to TOTP setup if needed
}

export function PrivateRoute({
    children,
    allowedRoles,
    redirectTo = '/auth/login',
    checkTotp = false,
}: PrivateRouteProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
        'loading'
    );
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Prevent running on server
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');
        if (!token || !userStr) {
            setStatus('unauthenticated');
            router.replace(redirectTo);
            return;
        }
        try {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            if (allowedRoles && (!parsedUser.role || !allowedRoles.includes(parsedUser.role))) {
                setStatus('unauthenticated');
                if (parsedUser.role === 'user') {
                    router.replace('/home');
                } else {
                    router.replace(redirectTo);
                }
                return;
            }
            if (checkTotp && parsedUser.role === 'user' && parsedUser.requiresTotpSetup) {
                router.replace('/user/totp?required=true');
                return;
            }
            setStatus('authenticated');
        } catch {
            setStatus('unauthenticated');
            router.replace(redirectTo);
        }
    }, [router, allowedRoles, redirectTo, checkTotp]);

    // Only render loading or children on client
    if (typeof window === 'undefined') {
        return null;
    }

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (status !== 'authenticated' || !user) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
