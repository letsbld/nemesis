'use client';

import React, { useState, useEffect } from 'react';
import { UserGroupList } from '@/components/admin/UserGroupList';
import { CreateUserGroupForm } from '@/components/admin/CreateUserGroupForm';
import { UserGroupData, CreateUserGroupData } from '@/types/admin.types';

const UserGroupPage = () => {
    const [groups, setGroups] = useState<UserGroupData[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch groups on component mount
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/user-groups');
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
            const response = await fetch('/api/admin/user-groups', {
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
                alert('User group created successfully!');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error creating user group:', error);
            alert('Failed to create user group. Please try again.');
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

export default UserGroupPage;
