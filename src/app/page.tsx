'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');
        if (!token || !userStr) {
            router.push('/auth/login');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            if ('role' in user) {
                if (user.role === 'admin') {
                    router.push('/dashboard');
                } else if (user.role === 'user') {
                    router.push('/home');
                } else {
                    router.push('/auth/login');
                }
            } else {
                router.push('/auth/login');
            }
        } catch {
            router.push('/auth/login');
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="text-lg mb-2">Data Loss Prevention Dashboard</div>
                <div className="text-gray-600">Loading...</div>
            </div>
        </div>
    );
}
