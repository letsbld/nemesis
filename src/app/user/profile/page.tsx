'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

interface UserProfile {
    username: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin: string;
}

export default function UserProfile() {
    const { user, token } = useAuth();
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await apiFetch('/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProfileData(data);
            } catch (err: any) {
                console.error('Failed to fetch profile:', err);
                setError(err.message || 'Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h1>
                
                {profileData && (
                    <div className="space-y-4">
                        <div className="border-b pb-4">
                            <h2 className="text-sm font-medium text-gray-500">Username</h2>
                            <p className="mt-1 text-lg text-gray-900">{profileData.username}</p>
                        </div>

                        <div className="border-b pb-4">
                            <h2 className="text-sm font-medium text-gray-500">Email</h2>
                            <p className="mt-1 text-lg text-gray-900">{profileData.email}</p>
                        </div>

                        <div className="border-b pb-4">
                            <h2 className="text-sm font-medium text-gray-500">Role</h2>
                            <p className="mt-1 text-lg text-gray-900">{profileData.role}</p>
                        </div>

                        <div className="border-b pb-4">
                            <h2 className="text-sm font-medium text-gray-500">Account Created</h2>
                            <p className="mt-1 text-lg text-gray-900">
                                {new Date(profileData.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-sm font-medium text-gray-500">Last Login</h2>
                            <p className="mt-1 text-lg text-gray-900">
                                {new Date(profileData.lastLogin).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
