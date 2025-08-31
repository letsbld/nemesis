'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserGroupList } from '@/components/admin/UserGroupList';
import { CreateUserGroupForm } from '@/components/admin/CreateUserGroupForm';
import { UserGroupData, CreateUserGroupData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';

const UserGroupsPage = () => {
    const { user, status } = useAuth();
    const router = useRouter();
    const [groups, setGroups] = useState<UserGroupData[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Check authentication and admin role
    useEffect(() => {
        console.log('[ADMIN USER GROUPS] user:', user);
        console.log('[ADMIN USER GROUPS] status:', status);

        if (status === 'loading') return; // Still loading

        if (!user) {
            console.log('[ADMIN USER GROUPS] Not authenticated, redirecting');
            router.push('/auth/login');
            return;
        }

        // Check if user is admin
        if ('role' in user) {
            if (user.role !== 'admin') {
                console.log('[ADMIN USER GROUPS] Not admin, role:', user.role);
                if (user.role === 'user') {
                    router.push('/home');
                } else {
                    router.push('/auth/login');
                }
                return;
            }
        } else {
            console.log('[ADMIN USER GROUPS] No role defined, redirecting');
            router.push('/auth/login');
            return;
        }
    }, [user, status, router]);

    // Fetch groups on component mount (only after auth check)
    useEffect(() => {
        if (user && 'role' in user && user.role === 'admin') {
            fetchGroups();
        }
    }, [user]);

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Show redirecting state if not admin
    if (!user || !('role' in user) || user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/api/user-groups');
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            } else {
                console.error('Failed to fetch user groups');
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async (groupData: CreateUserGroupData) => {
        setIsCreating(true);
        try {
            const response = await apiFetch('/api/user-groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(groupData),
            });

            if (response.ok) {
                const newGroup = await response.json();
                setGroups((prev) => [...prev, newGroup]);
                setShowCreateForm(false);
                toast.success('User group created successfully!');
            } else {
                const errorData = await response.json();
                toast.error(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error creating user group:', error);
            toast.error('Failed to create user group. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    if (showCreateForm) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <CreateUserGroupForm
                    onSubmit={handleCreateGroup}
                    onCancel={() => setShowCreateForm(false)}
                    isLoading={isCreating}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <UserGroupList
                groups={groups}
                onCreateGroup={() => setShowCreateForm(true)}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UserGroupsPage;
