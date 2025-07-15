'use client';

import { UserGroupData } from '@/types/admin.types';
import CustomButton from '@/components/ui/customButton';
import { formatDate } from '@/lib/date-utils';
import { useRouter } from 'next/navigation';

interface UserGroupListProps {
    groups: UserGroupData[];
    onCreateGroup: () => void;
    isLoading?: boolean;
}

export function UserGroupList({ groups, onCreateGroup, isLoading = false }: UserGroupListProps) {
    const router = useRouter();

    const handleManageMembers = (groupId: string) => {
        router.push(`/admin/user-groups/${groupId}/members`);
    };
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Group Management</h1>
                <CustomButton
                    name="Create New Group"
                    onClick={onCreateGroup}
                    btnType="button"
                    style="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                    loading={isLoading}
                />
            </div>

            {groups.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No user groups found</p>
                    <CustomButton
                        name="Create First Group"
                        onClick={onCreateGroup}
                        btnType="button"
                        style="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                    />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {group.name}
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                        onClick={() => {
                                            /* TODO: Handle edit */
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 text-sm"
                                        onClick={() => {
                                            /* TODO: Handle delete */
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {group.description && (
                                <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                            )}

                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Created: {formatDate(group.created_at)}</span>
                                <CustomButton
                                    name="Manage Members"
                                    onClick={() => handleManageMembers(group.id)}
                                    btnType="button"
                                    style="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 text-xs"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
