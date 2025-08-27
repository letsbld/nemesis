'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserList } from '@/components/admin/UserList';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { EditUserForm } from '@/components/admin/EditUserForm';
import { CSVImportForm } from '@/components/admin/CSVImportForm';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';

const UsersPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [showCSVImport, setShowCSVImport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Check authentication and admin role
    useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (!session) {
            // Not authenticated, redirect to login
            router.push('/auth/login');
            return;
        }

        // Check if user is admin
        if (session.user && 'role' in session.user) {
            if (session.user.role !== 'admin') {
                // Not an admin, redirect to appropriate page
                if (session.user.role === 'user') {
                    router.push('/home');
                } else {
                    router.push('/auth/login');
                }
                return;
            }
        } else {
            // No role defined, redirect to login
            router.push('/auth/login');
            return;
        }
    }, [session, status, router]);

    // Fetch users on component mount (only after auth check)
    useEffect(() => {
        if (session?.user && 'role' in session.user && session.user.role === 'admin') {
            fetchUsers();
        }
    }, [session]);

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
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

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (userData: CreateUserData) => {
        setIsCreating(true);
        try {
            const newUser = await apiFetch('/admin/users', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' },
            });
            setUsers((prev) => [...prev, newUser]);
            setShowCreateForm(false);
            toast.success('User created successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to create user.'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditUser = (user: UserData) => {
        console.log('Editing user:', user);
        setEditingUser(user);
        setShowEditForm(true);
    };

    const handleUpdateUser = async (userId: string, userData: Partial<CreateUserData>) => {
        setIsUpdating(true);
        try {
            const updatedUser = await apiFetch(`/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' },
            });
            setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)));
            setShowEditForm(false);
            setEditingUser(null);
            toast.success('User updated successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to update user.'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }
        try {
            await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
            setUsers((prev) => prev.filter((user) => user.id !== userId));
            toast.success('User deleted successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to delete user.'}`);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!confirm("Are you sure you want to reset this user's password?")) {
            return;
        }
        try {
            const data = await apiFetch(`/admin/users/${userId}/reset-password`, { method: 'POST' });
            toast.success(`Password reset successfully! New password: ${data.newPassword}`);
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to reset password.'}`);
        }
    };

    if (showCreateForm) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <CreateUserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => setShowCreateForm(false)}
                    isLoading={isCreating}
                />
            </div>
        );
    }

    if (showEditForm && editingUser) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <EditUserForm
                    user={editingUser}
                    onSubmit={(userData) => handleUpdateUser(editingUser.id, userData)}
                    onCancel={() => {
                        setShowEditForm(false);
                        setEditingUser(null);
                    }}
                    isLoading={isUpdating}
                />
            </div>
        );
    }

    if (showCSVImport) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <CSVImportForm
                    onImportComplete={() => {
                        fetchUsers(); // Refresh user list after import
                        setShowCSVImport(false);
                    }}
                    onClose={() => setShowCSVImport(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <UserList
                users={users}
                onCreateUser={() => setShowCreateForm(true)}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onImportCSV={() => setShowCSVImport(true)}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UsersPage;
    if (showEditForm && editingUser) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <EditUserForm
                    user={editingUser}
                    onSubmit={(userData) => handleUpdateUser(editingUser.id, userData)}
                    onCancel={() => {
                        setShowEditForm(false);
                        setEditingUser(null);
                    }}
                    isLoading={isUpdating}
                />
            </div>
        );
    }

    if (showCSVImport) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <CSVImportForm
                    onImportComplete={() => {
                        fetchUsers(); // Refresh user list after import
                        setShowCSVImport(false);
                    }}
                    onClose={() => setShowCSVImport(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <UserList
                users={users}
                onCreateUser={() => setShowCreateForm(true)}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onImportCSV={() => setShowCSVImport(true)}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UsersPage;
