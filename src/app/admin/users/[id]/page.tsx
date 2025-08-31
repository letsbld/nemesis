'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';

const EditUserPage = () => {
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
        manager_id: '',
        company_email: '',
        alternate_email: '',
    });
    const [users, setUsers] = useState<{ id: string; display_name: string }[]>([]);

    // Auth state
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
        'loading'
    );
    const [authUser, setAuthUser] = useState<any>(null);

    // Extract userId from params
    useEffect(() => {
        if (params?.id) {
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            setUserId(id);
        }
    }, [params]);

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');
        console.log('[ADMIN EDIT USER] localStorage.authToken:', token);
        console.log('[ADMIN EDIT USER] localStorage.authUser:', userStr);

        if (!token || !userStr) {
            console.log('[ADMIN EDIT USER] Not authenticated, redirecting');
            setAuthStatus('unauthenticated');
            router.push('/auth/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(userStr);
            console.log('[ADMIN EDIT USER] Parsed user:', parsedUser);
            setAuthUser(parsedUser);
            if (parsedUser.role !== 'admin') {
                console.log('[ADMIN EDIT USER] Not admin, role:', parsedUser.role);
                setAuthStatus('unauthenticated');
                if (parsedUser.role === 'user') {
                    router.push('/home');
                } else {
                    router.push('/auth/login');
                }
                return;
            }
            setAuthStatus('authenticated');
        } catch (e) {
            console.log('[ADMIN EDIT USER] Error parsing user:', e);
            setAuthStatus('unauthenticated');
            router.push('/auth/login');
        }
    }, [router]);

    // Fetch user data
    useEffect(() => {
        if (userId && authStatus === 'authenticated' && authUser && authUser.role === 'admin') {
            fetchUser();
        }
    }, [userId, authStatus, authUser]);

    // Fetch all users for manager dropdown
    useEffect(() => {
        async function fetchUsersList() {
            try {
                const data = await apiFetch('/user');
                setUsers(
                    data.map((u: any) => ({
                        id: u.id,
                        display_name: u.display_name,
                    }))
                );
            } catch {
                setUsers([]);
            }
        }
        fetchUsersList();
    }, []);

    const fetchUser = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const userData = await apiFetch(`/user/${userId}`);
            setUser(userData);
            setFormData({
                username: userData.username || '',
                display_name: userData.display_name || '',
                first_name: userData.first_name || '',
                middle_name: userData.middle_name || '',
                last_name: userData.last_name || '',
                manager_id: userData.manager_id || '', // use manager_id
                company_email: userData.company_email || '',
                alternate_email: userData.alternate_email || '',
            });
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to fetch user data.'}`);
            router.push('/admin/users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            // Remove manager_name, send manager_id
            const payload = { ...formData };
            delete (payload as any).manager_name;
            await apiFetch(`/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            toast.success('User updated successfully!');
            router.push('/admin/users');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to update user.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state
    if (authStatus === 'loading' || isLoading || !userId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading user data...</div>
            </div>
        );
    }

    // Show redirecting state if not admin
    if (authStatus !== 'authenticated' || !authUser || authUser.role !== 'admin') {
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
                                    Manager
                                </label>
                                <select
                                    name="manager_id"
                                    value={formData.manager_id || ''}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="">Select a manager</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.display_name}
                                        </option>
                                    ))}
                                </select>
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