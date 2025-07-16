'use client';

import { UserData } from '@/types/admin.types';
import CustomButton from '@/components/ui/customButton';
import { formatDate } from '@/lib/date-utils';

interface UserListProps {
    users: UserData[];
    onCreateUser: () => void;
    onImportCSV: () => void;
    isLoading?: boolean;
}

export function UserList({ users, onCreateUser, onImportCSV, isLoading = false }: UserListProps) {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <div className="flex gap-3">
                    <CustomButton
                        name="Import CSV"
                        onClick={onImportCSV}
                        btnType="button"
                        style="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                        loading={isLoading}
                    />
                    <CustomButton
                        name="Create New User"
                        onClick={onCreateUser}
                        btnType="button"
                        style="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                        loading={isLoading}
                    />
                </div>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No users found</p>
                    <div className="flex gap-3 justify-center">
                        <CustomButton
                            name="Import from CSV"
                            onClick={onImportCSV}
                            btnType="button"
                            style="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                        />
                        <CustomButton
                            name="Create First User"
                            onClick={onCreateUser}
                            btnType="button"
                            style="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Manager
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.display_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.first_name} {user.middle_name}{' '}
                                                {user.last_name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {user.company_email}
                                        </div>
                                        {user.alternate_email && (
                                            <div className="text-sm text-gray-500">
                                                {user.alternate_email}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {user.manager_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(user.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            onClick={() => {
                                                /* TODO: Handle edit */
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => {
                                                /* TODO: Handle delete */
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
