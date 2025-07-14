'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserData, GroupUserData, AddUsersToGroupData } from '@/types/admin.types';

interface UserGroupMembershipProps {
    groupId: string;
    groupName: string;
}

export const UserGroupMembership: React.FC<UserGroupMembershipProps> = ({ groupId, groupName }) => {
    const [groupUsers, setGroupUsers] = useState<GroupUserData[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingUsers, setIsAddingUsers] = useState(false);
    const [showAddUsersForm, setShowAddUsersForm] = useState(false);

    const fetchGroupUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/user-groups/${groupId}/users`);
            if (response.ok) {
                const users = await response.json();
                setGroupUsers(users);
            } else {
                console.error('Failed to fetch group users');
            }
        } catch (error) {
            console.error('Error fetching group users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    const fetchAllUsers = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const users = await response.json();
                setAllUsers(users);
            } else {
                console.error('Failed to fetch all users');
            }
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    }, []);

    useEffect(() => {
        fetchGroupUsers();
        fetchAllUsers();
    }, [fetchGroupUsers, fetchAllUsers]);

    const handleAddUsers = async () => {
        if (selectedUserIds.length === 0) return;

        setIsAddingUsers(true);
        try {
            const response = await fetch(`/api/admin/user-groups/${groupId}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds: selectedUserIds } as AddUsersToGroupData),
            });

            if (response.ok) {
                await fetchGroupUsers(); // Refresh the group users list
                setSelectedUserIds([]);
                setShowAddUsersForm(false);
                alert('Users added to group successfully!');
            } else {
                const errorData = await response.json();
                alert(`Failed to add users: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error adding users to group:', error);
            alert('An error occurred while adding users to the group');
        } finally {
            setIsAddingUsers(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user from the group?')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/user-groups/${groupId}/users?userId=${userId}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                await fetchGroupUsers(); // Refresh the group users list
                alert('User removed from group successfully!');
            } else {
                const errorData = await response.json();
                alert(`Failed to remove user: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error removing user from group:', error);
            alert('An error occurred while removing the user from the group');
        }
    };

    const handleUserSelection = (userId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedUserIds((prev) => [...prev, userId]);
        } else {
            setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
        }
    };

    // Filter out users who are already in the group
    const availableUsers = allUsers.filter(
        (user) => !groupUsers.some((groupUser) => groupUser.id === user.id)
    );

    if (isLoading) {
        return <div className="p-4">Loading group users...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold mb-2">Group Members: {groupName}</h2>
                <p className="text-gray-600">
                    Manage users in this group ({groupUsers.length} members)
                </p>
            </div>

            {/* Add Users Section */}
            <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add Users to Group</h3>
                    <button
                        onClick={() => setShowAddUsersForm(!showAddUsersForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        {showAddUsersForm ? 'Cancel' : 'Add Users'}
                    </button>
                </div>

                {showAddUsersForm && (
                    <div className="space-y-4">
                        <div className="max-h-60 overflow-y-auto border rounded p-4">
                            <h4 className="font-medium mb-2">
                                Select users to add ({availableUsers.length} available)
                            </h4>
                            {availableUsers.length === 0 ? (
                                <p className="text-gray-500">No available users to add.</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableUsers.map((user) => (
                                        <label
                                            key={user.id}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={(e) =>
                                                    handleUserSelection(user.id, e.target.checked)
                                                }
                                                className="rounded"
                                            />
                                            <span>
                                                {user.display_name} ({user.company_email})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedUserIds.length > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    {selectedUserIds.length} user(s) selected
                                </span>
                                <button
                                    onClick={handleAddUsers}
                                    disabled={isAddingUsers}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                                >
                                    {isAddingUsers ? 'Adding...' : 'Add Selected Users'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Current Group Members */}
            <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Current Group Members</h3>
                </div>
                <div className="p-4">
                    {groupUsers.length === 0 ? (
                        <p className="text-gray-500">No users in this group yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {groupUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex justify-between items-center p-3 border rounded-lg"
                                >
                                    <div>
                                        <div className="font-medium">{user.display_name}</div>
                                        <div className="text-sm text-gray-600">
                                            {user.company_email} • @{user.username}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
