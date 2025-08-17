'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserData, CreateUserData } from '@/types/admin.types';

const EditUserPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [userId, setUserId] = useState<string | null>(null);

    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateUserData>>({
        username: '',
        display_name: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        manager_name: '',
        company_email: '',
        alternate_email: '',
    });

    // Extract userId from params
    useEffect(() => {
        const extractUserId = async () => {
            if (params?.id) {
                const id = Array.isArray(params.id) ? params.id[0] : params.id;
                setUserId(id);
            }
        };
        extractUserId();
    }, [params]);

    // Authentication check
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/login');
            return;
        }

        if (session.user && 'role' in session.user) {
            if (session.user.role !== 'admin') {
                if (session.user.role === 'user') {
                    router.push('/home');
                } else {
                    router.push('/auth/login');
                }
                return;
            }
        } else {
            router.push('/auth/login');
            return;
        }
    }, [session, status, router]);

    // Fetch user data
    useEffect(() => {
        if (userId && session?.user && 'role' in session.user && session.user.role === 'admin') {
            fetchUser();
        }
    }, [userId, session]);

    const fetchUser = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            console.log('Fetching user with ID:', userId);
            const response = await fetch(`/api/admin/users/${userId}`);

            if (response.ok) {
                const userData = await response.json();
                console.log('Fetched user data:', userData);
                setUser(userData);

                // Populate form data with correct field mapping
                setFormData({
                    username: userData.username || '',
                    display_name: userData.display_name || '',
                    first_name: userData.first_name || '',
                    middle_name: userData.middle_name || '',
                    last_name: userData.last_name || '',
                    manager_name: userData.manager_name || '',
                    company_email: userData.company_email || '',
                    alternate_email: userData.alternate_email || '',
                });
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                toast.error(`Error: ${errorData.error}`);
                router.push('/admin/users');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Failed to fetch user data');
            router.push('/admin/users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setIsSaving(true);

        try {
            console.log('Updating user with data:', formData);
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('User updated successfully!');
                router.push('/admin/users');
            } else {
                const errorData = await response.json();
                console.error('Update error:', errorData);
                toast.error(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state
    if (status === 'loading' || isLoading || !userId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading user data...</div>
            </div>
        );
    }

    // Show redirecting state if not admin
    if (!session || !session.user || !('role' in session.user) || session.user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">User not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Edit User: {user.display_name}
                        </h2>
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Back to Users
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name *
                                </label>
                                <input
                                    type="text"
                                    name="display_name"
                                    value={formData.display_name || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name || ''}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Manager Name
                                </label>
                                <input
                                    type="text"
                                    name="manager_name"
                                    value={formData.manager_name || ''}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Email *
                                </label>
                                <input
                                    type="email"
                                    name="company_email"
                                    value={formData.company_email || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alternate Email
                                </label>
                                <input
                                    type="email"
                                    name="alternate_email"
                                    value={formData.alternate_email || ''}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Updating...' : 'Update User'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/admin/users')}
                                disabled={isSaving}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserPage;
