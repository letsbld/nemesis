'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface GoogleWorkspaceUser {
    id: string;
    primaryEmail: string;
    name: {
        familyName: string;
        givenName: string;
        fullName: string;
    };
    orgUnitPath: string;
    suspended: boolean;
    archived: boolean;
    isAdmin?: boolean;
    lastLoginTime?: string;
    creationTime: string;
    organizations?: Array<{
        name: string;
        title: string;
        department: string;
    }>;
}

interface ImportResult {
    success: boolean;
    message: string;
    details: {
        totalUsers: number;
        importedUsers: number;
        skippedUsers: number;
        errors: string[];
    };
}

export default function GoogleWorkspaceImportPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>(
        'unknown'
    );
    const [adminDomain, setAdminDomain] = useState<string | null>(null);
    const [users, setUsers] = useState<GoogleWorkspaceUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [importSettings, setImportSettings] = useState({
        domain: '',
        maxResults: 100,
        createDefaultPassword: true,
    });

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || !('role' in session.user) || session.user.role !== 'admin') {
            router.push('/auth/login');
            return;
        }

        // Test connection and get admin domain on load
        testConnection();
        getAdminDomain();
    }, [session, status, router]);

    const testConnection = async () => {
        try {
            const response = await fetch('/api/admin/google-workspace?action=test-connection');
            const data = await response.json();

            if (data.success) {
                setConnectionStatus('connected');
                toast.success('Google Workspace connection successful');
            } else {
                setConnectionStatus('error');
                toast.error(`Connection failed: ${data.error}`);
            }
        } catch (error: any) {
            setConnectionStatus('error');
            console.error('Connection test failed:', error);
            toast.error('Failed to test Google Workspace connection');
        }
    };

    const getAdminDomain = async () => {
        try {
            const response = await fetch('/api/admin/google-workspace?action=get-domain');
            const data = await response.json();

            if (data.success && data.domain) {
                setAdminDomain(data.domain);
                setImportSettings((prev) => ({ ...prev, domain: data.domain }));
            }
        } catch (error) {
            console.error('Failed to get admin domain:', error);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                action: 'fetch-users',
                ...(importSettings.domain && { domain: importSettings.domain }),
                maxResults: importSettings.maxResults.toString(),
            });

            const response = await fetch(`/api/admin/google-workspace?${queryParams}`);
            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
                toast.success(`Fetched ${data.users.length} users from Google Workspace`);
            } else {
                toast.error(`Failed to fetch users: ${data.error}`);
            }
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to fetch users from Google Workspace');
        } finally {
            setIsLoading(false);
        }
    };

    const importUsers = async () => {
        if (selectedUsers.size === 0) {
            toast.error('Please select users to import');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/google-workspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'import-users',
                    domain: importSettings.domain,
                    maxResults: importSettings.maxResults,
                    createDefaultPassword: importSettings.createDefaultPassword,
                }),
            });

            const data: ImportResult = await response.json();

            if (data.success) {
                toast.success(data.message);
                setSelectedUsers(new Set());
                // Refresh user list
                fetchUsers();
            } else {
                toast.error(`Import failed: ${data.details?.errors?.[0] || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error('Import failed:', error);
            toast.error('Failed to import users');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUsers(newSelection);
    };

    const selectAllUsers = () => {
        const availableUsers = users.filter((user) => !user.suspended && !user.archived);
        setSelectedUsers(new Set(availableUsers.map((user) => user.id)));
    };

    const clearSelection = () => {
        setSelectedUsers(new Set());
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Google Workspace User Import
                </h1>
                <p className="text-gray-600">
                    Import users from your Google Workspace domain into the DLP Dashboard.
                </p>
            </div>

            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Status</h2>
                <div className="flex items-center space-x-4">
                    <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            connectionStatus === 'connected'
                                ? 'bg-green-100 text-green-800'
                                : connectionStatus === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                        {connectionStatus === 'connected'
                            ? 'Connected'
                            : connectionStatus === 'error'
                            ? 'Connection Error'
                            : 'Testing...'}
                    </div>
                    {adminDomain && <span className="text-gray-600">Domain: {adminDomain}</span>}
                    <button
                        onClick={testConnection}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Test Connection
                    </button>
                </div>
            </div>

            {/* Import Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Domain (optional)
                        </label>
                        <input
                            type="text"
                            value={importSettings.domain}
                            onChange={(e) =>
                                setImportSettings((prev) => ({ ...prev, domain: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Results
                        </label>
                        <input
                            type="number"
                            value={importSettings.maxResults}
                            onChange={(e) =>
                                setImportSettings((prev) => ({
                                    ...prev,
                                    maxResults: parseInt(e.target.value) || 100,
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            max="500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="createDefaultPassword"
                            checked={importSettings.createDefaultPassword}
                            onChange={(e) =>
                                setImportSettings((prev) => ({
                                    ...prev,
                                    createDefaultPassword: e.target.checked,
                                }))
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="createDefaultPassword"
                            className="ml-2 block text-sm text-gray-700"
                        >
                            Create default password (TempPassword123!)
                        </label>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={fetchUsers}
                        disabled={isLoading || connectionStatus !== 'connected'}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Fetching...' : 'Fetch Users'}
                    </button>
                </div>
            </div>

            {/* User List */}
            {users.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Google Workspace Users ({users.length})
                        </h2>
                        <div className="space-x-2">
                            <button
                                onClick={selectAllUsers}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Select All Active
                            </button>
                            <button
                                onClick={clearSelection}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Clear Selection
                            </button>
                            <button
                                onClick={importUsers}
                                disabled={isLoading || selectedUsers.size === 0}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading
                                    ? 'Importing...'
                                    : `Import Selected (${selectedUsers.size})`}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Select
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Organization
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={
                                            user.suspended || user.archived ? 'bg-gray-50' : ''
                                        }
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => toggleUserSelection(user.id)}
                                                disabled={user.suspended || user.archived}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.name.givenName} {user.name.familyName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.primaryEmail}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.organizations?.[0]?.name || 'N/A'}
                                            {user.organizations?.[0]?.title && (
                                                <div className="text-xs text-gray-500">
                                                    {user.organizations[0].title}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.suspended
                                                        ? 'bg-red-100 text-red-800'
                                                        : user.archived
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {user.suspended
                                                    ? 'Suspended'
                                                    : user.archived
                                                    ? 'Archived'
                                                    : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.lastLoginTime
                                                ? new Date(user.lastLoginTime).toLocaleDateString()
                                                : 'Never'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
