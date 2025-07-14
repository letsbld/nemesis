'use client';

import React, { useState, useEffect } from 'react';
import { UserList } from '@/components/admin/UserList';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { UserData, CreateUserData } from '@/types/admin.types';

const UserPage = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (userData: CreateUserData) => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const newUser = await response.json();
                setUsers((prev) => [...prev, newUser]);
                setShowCreateForm(false);
                alert('User created successfully!');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user. Please try again.');
        } finally {
            setIsCreating(false);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <UserList
                users={users}
                onCreateUser={() => setShowCreateForm(true)}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UserPage;
