'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (!session) {
            // Not authenticated, redirect to login
            router.push('/auth/login');
            return;
        }

        // Check user role and redirect accordingly
        if (session.user && 'role' in session.user) {
            if (session.user.role === 'admin') {
                router.push('/dashboard');
            } else if (session.user.role === 'user') {
                router.push('/home');
            } else {
                // Unknown role, redirect to login
                router.push('/auth/login');
            }
        } else {
            // No role defined, redirect to login
            router.push('/auth/login');
        }
    }, [session, status, router]);

    // Show loading state while checking authentication
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="text-lg mb-2">Data Loss Prevention Dashboard</div>
                <div className="text-gray-600">Loading...</div>
            </div>
        </div>
    );
}
