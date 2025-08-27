'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    id: string;
    username: string;
    role?: string;
    exp?: number;
    requiresTotpSetup?: boolean;
}

export default function UserHomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');

        console.log(
            '*** ------------------------------------------------ ---------------------------------- *************************'
        );
        console.log(token, userStr, 'here!!!!!');

        if (!token || !userStr) {
            router.replace('/auth/login');
            return;
        }

        try {
            // Decode JWT to check expiration
            const decoded: DecodedToken = jwtDecode(token);

            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                // Token expired → clear and redirect
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                router.replace('/auth/login');
                return;
            }

            const parsedUser = JSON.parse(userStr);

            // Redirect if role mismatch
            // if (parsedUser.role === 'admin') {
            //     router.replace('/dashboard');
            //     return;
            // }

            // if (parsedUser.role !== 'user') {
            //     router.replace('/auth/login');
            //     return;
            // }

            // // Handle TOTP if required
            // if (parsedUser.requiresTotpSetup) {
            //     router.replace('/user/totp?required=true');
            //     return;
            // }

            // Everything valid → set user
            setUser(parsedUser);
        } catch (err) {
            console.error('Invalid token:', err);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            router.replace('/auth/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    console.log('User state:', user);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    const displayName = user.display_name || user.name || '';
    const username = user.username || '';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to the DLP Dashboard
                    </h1>
                    <p className="text-xl text-gray-600">Hello, {displayName || 'User'}!</p>
                    {username && <p className="text-sm text-gray-500 mt-1">Username: {username}</p>}
                </div>

                {/* --- keep your feature cards, quick actions, etc. unchanged --- */}
            </div>
        </div>
    );
}
