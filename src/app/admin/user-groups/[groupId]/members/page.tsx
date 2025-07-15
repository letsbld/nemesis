'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserGroupMembership } from '@/components/admin/UserGroupMembership';
import { UserGroupData } from '@/types/admin.types';

const GroupMembersPage = () => {
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;

    const [group, setGroup] = useState<UserGroupData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGroup = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/user-groups/${groupId}`);
            if (response.ok) {
                const groupData = await response.json();
                setGroup(groupData);
            } else {
                console.error('Failed to fetch group details');
                // Redirect back to group list if group not found
                router.push('/admin/user-groups');
            }
        } catch (error) {
            console.error('Error fetching group:', error);
            router.push('/admin/user-groups');
        } finally {
            setIsLoading(false);
        }
    }, [groupId, router]);

    useEffect(() => {
        if (groupId) {
            fetchGroup();
        }
    }, [groupId, fetchGroup]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading group details...</div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-600">Group not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/admin/user-groups')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded mb-4"
                >
                    ← Back to Groups
                </button>
            </div>

            <UserGroupMembership groupId={groupId} groupName={group.name} />
        </div>
    );
};

export default GroupMembersPage;
