'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Play, Edit, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DeviceCommandData, CreateDeviceCommandData, CommandGroupData, CreateCommandGroupData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import toast from 'react-hot-toast';

const DeviceCommandsPage = () => {
    const router = useRouter();
    const [commands, setCommands] = useState<DeviceCommandData[]>([]);
    const [commandGroups, setCommandGroups] = useState<CommandGroupData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isExecuting, setIsExecuting] = useState<string | null>(null);
    const [editingCommand, setEditingCommand] = useState<DeviceCommandData | null>(null);
    const [editingGroup, setEditingGroup] = useState<CommandGroupData | null>(null);

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');
        if (!token || !userStr) {
            router.push('/auth/admin/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser.role !== 'admin') {
                router.push('/user/applications');
                return;
            }
        } catch {
            router.push('/auth/admin/login');
        }
    }, [router]);

    // Fetch data
    useEffect(() => {
        fetchCommands();
        fetchCommandGroups();
    }, []);

    const fetchCommands = async () => {
        try {
            const response = await apiFetch('/device/commands');
            // API returns array directly or wrapped in commands property
            const commandsArray = Array.isArray(response) ? response : (response?.commands || []);
            setCommands(commandsArray);
        } catch (error: any) {
            toast.error(`Error fetching commands: ${error?.error || 'Failed to fetch commands.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCommandGroups = async () => {
        try {
            const response = await apiFetch('/command-group/');
            // API returns array directly or wrapped in commandGroups property
            const groupsArray = Array.isArray(response) ? response : (response?.commandGroups || []);
            setCommandGroups(groupsArray);
        } catch (error: any) {
            console.error('Error fetching command groups:', error);
        }
    };

    const handleCreateCommand = async (commandData: CreateDeviceCommandData) => {
        setIsCreating(true);
        try {
            await apiFetch('/device/commands', {
                method: 'POST',
                body: JSON.stringify(commandData),
                headers: { 'Content-Type': 'application/json' },
            });
            setShowCreateForm(false);
            fetchCommands();
            toast.success('Command created successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to create command.'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleExecuteCommand = async (commandId: string) => {
        setIsExecuting(commandId);
        try {
            // Note: The API documentation doesn't show an execute endpoint
            // Using POST to the command ID as shown in your original code
            await apiFetch(`/device/commands/${commandId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            fetchCommands();
            toast.success('Command execution triggered!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to execute command.'}`);
        } finally {
            setIsExecuting(null);
        }
    };

    const handleGetCommandById = async (commandId: string) => {
        try {
            const command = await apiFetch(`/device/commands/${commandId}`);
            return command;
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to fetch command.'}`);
            return null;
        }
    };

    const handleUpdateCommand = async (commandId: string, commandData: CreateDeviceCommandData) => {
        try {
            await apiFetch(`/device/commands/${commandId}`, {
                method: 'PUT',
                body: JSON.stringify(commandData),
                headers: { 'Content-Type': 'application/json' },
            });
            fetchCommands();
            toast.success('Command updated successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to update command.'}`);
        }
    };

    const handleDeleteCommand = async (commandId: string) => {
        if (!confirm('Are you sure you want to delete this command?')) {
            return;
        }
        try {
            await apiFetch(`/device/commands/${commandId}`, { method: 'DELETE' });
            fetchCommands();
            toast.success('Command deleted successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to delete command.'}`);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'executing':
                return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'pending':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
            case 'executing':
                return 'text-blue-600 bg-blue-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    // Command Group Operations
    const handleGetCommandGroupById = async (groupId: string) => {
        try {
            const group = await apiFetch(`/command-group/${groupId}`);
            return group;
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to fetch command group.'}`);
            return null;
        }
    };

    const handleCreateCommandGroup = async (groupData: CreateCommandGroupData) => {
        try {
            await apiFetch('/command-group/', {
                method: 'POST',
                body: JSON.stringify(groupData),
                headers: { 'Content-Type': 'application/json' },
            });
            setShowCreateGroupForm(false);
            fetchCommandGroups();
            toast.success('Command group created successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to create command group.'}`);
        }
    };

    const handleUpdateCommandGroup = async (groupId: string, groupData: CreateCommandGroupData) => {
        try {
            await apiFetch(`/command-group/${groupId}`, {
                method: 'PUT',
                body: JSON.stringify(groupData),
                headers: { 'Content-Type': 'application/json' },
            });
            fetchCommandGroups();
            toast.success('Command group updated successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to update command group.'}`);
        }
    };

    const handleDeleteCommandGroup = async (groupId: string) => {
        if (!confirm('Are you sure you want to delete this command group?')) {
            return;
        }
        try {
            await apiFetch(`/command-group/${groupId}`, { method: 'DELETE' });
            fetchCommandGroups();
            toast.success('Command group deleted successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to delete command group.'}`);
        }
    };

    const filteredCommands = commands.filter(command => {
        const matchesSearch = (command.device_id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                             (command.command_type?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || command.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading commands...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">Device Commands</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {commands.length} commands
                    </span>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Command</span>
                    </button>
                    <button
                        onClick={() => setShowCreateGroupForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Group</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search commands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="executing">Executing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Commands List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Commands</h3>
                </div>
                <div className="overflow-x-auto">
                    {filteredCommands.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No commands found</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Device ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Command Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCommands.map((command) => (
                                    <tr key={command.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {command.device_id || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {command.command_type || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(command.status || 'pending')}`}>
                                                {getStatusIcon(command.status || 'pending')}
                                                <span className="ml-1 capitalize">{command.status || 'pending'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {command.created_at ? new Date(command.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {(command.status || 'pending') === 'pending' && (
                                                    <button
                                                        onClick={() => handleExecuteCommand(command.id)}
                                                        disabled={isExecuting === command.id}
                                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setEditingCommand(command)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCommand(command.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Command Groups */}
            {commandGroups.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Command Groups</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {commandGroups.map((group) => (
                                <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{group.name}</h4>
                                            {group.description && (
                                                <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                {group.commandIds?.length || 0} commands
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-2">
                                            <button
                                                onClick={() => setEditingGroup(group)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit Group"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCommandGroup(group.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Group"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Command Modal */}
            {showCreateForm && (
                <CreateDeviceCommandForm
                    onSubmit={handleCreateCommand}
                    onCancel={() => setShowCreateForm(false)}
                    isLoading={isCreating}
                />
            )}

            {/* Create Command Group Modal */}
            {showCreateGroupForm && (
                <CreateCommandGroupForm
                    onSubmit={handleCreateCommandGroup}
                    onCancel={() => setShowCreateGroupForm(false)}
                    commands={commands}
                />
            )}

            {/* Edit Command Modal */}
            {editingCommand && (
                <EditDeviceCommandForm
                    onSubmit={(commandData) => {
                        handleUpdateCommand(editingCommand.id, commandData);
                        setEditingCommand(null);
                    }}
                    onCancel={() => setEditingCommand(null)}
                    initialData={{
                        device_id: editingCommand.device_id,
                        command_type: editingCommand.command_type,
                        command_payload: editingCommand.command_payload
                    }}
                    isLoading={false}
                />
            )}

            {/* Edit Command Group Modal */}
            {editingGroup && (
                <CreateCommandGroupForm
                    onSubmit={(groupData) => {
                        handleUpdateCommandGroup(editingGroup.id, groupData);
                        setEditingGroup(null);
                    }}
                    onCancel={() => setEditingGroup(null)}
                    commands={commands}
                    initialData={{
                        name: editingGroup.name,
                        description: editingGroup.description,
                        commandIds: editingGroup.commandIds || []
                    }}
                />
            )}
        </div>
    );
};

// Create Command Form Component
const CreateDeviceCommandForm: React.FC<{
    onSubmit: (data: CreateDeviceCommandData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: Partial<CreateDeviceCommandData>;
}> = ({ onSubmit, onCancel, isLoading, initialData }) => {
    const [formData, setFormData] = useState<CreateDeviceCommandData>({
        device_id: '',
        command_type: 'reboot',
        command_payload: { delay: 5 }
    });

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Device Command</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device ID *
                        </label>
                        <input
                            type="text"
                            name="device_id"
                            value={formData.device_id}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="e.g., f22bd7be-c436-4107-a1ab-103e05bc434b"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Command Type *
                        </label>
                        <select
                            name="command_type"
                            value={formData.command_type}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="reboot">Reboot</option>
                            <option value="shutdown">Shutdown</option>
                            <option value="update">Update</option>
                            <option value="scan">Scan</option>
                            <option value="lock">Lock</option>
                            <option value="unlock">Unlock</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delay (seconds)
                        </label>
                        <input
                            type="number"
                            name="delay"
                            value={formData.command_payload.delay || 0}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                command_payload: { ...prev.command_payload, delay: parseInt(e.target.value) || 0 }
                            }))}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating...' : 'Create Command'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Command Form Component (separate for clarity)
const EditDeviceCommandForm: React.FC<{
    onSubmit: (data: CreateDeviceCommandData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: Partial<CreateDeviceCommandData>;
}> = ({ onSubmit, onCancel, isLoading, initialData }) => {
    const [formData, setFormData] = useState<CreateDeviceCommandData>({
        device_id: '',
        command_type: 'reboot',
        command_payload: { delay: 5 }
    });

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Device Command</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device ID *
                        </label>
                        <input
                            type="text"
                            name="device_id"
                            value={formData.device_id}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="e.g., f22bd7be-c436-4107-a1ab-103e05bc434b"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Command Type *
                        </label>
                        <select
                            name="command_type"
                            value={formData.command_type}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="reboot">Reboot</option>
                            <option value="shutdown">Shutdown</option>
                            <option value="update">Update</option>
                            <option value="scan">Scan</option>
                            <option value="lock">Lock</option>
                            <option value="unlock">Unlock</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delay (seconds)
                        </label>
                        <input
                            type="number"
                            name="delay"
                            value={formData.command_payload.delay || 0}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                command_payload: { ...prev.command_payload, delay: parseInt(e.target.value) || 0 }
                            }))}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Updating...' : 'Update Command'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Create Command Group Form Component
const CreateCommandGroupForm: React.FC<{
    onSubmit: (data: CreateCommandGroupData) => void;
    onCancel: () => void;
    commands?: DeviceCommandData[];
    initialData?: Partial<CreateCommandGroupData>;
}> = ({ onSubmit, onCancel, commands = [], initialData }) => {
    const [formData, setFormData] = useState<CreateCommandGroupData>({
        name: '',
        description: '',
        commandIds: []
    });

    // Initialize form data
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCommandToggle = (commandId: string) => {
        setFormData(prev => ({
            ...prev,
            commandIds: prev.commandIds.includes(commandId)
                ? prev.commandIds.filter(id => id !== commandId)
                : [...prev.commandIds, commandId]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {initialData ? 'Edit Command Group' : 'Create Command Group'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Emergency Reboots"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Commands *
                        </label>
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {commands.length === 0 ? (
                                <p className="text-sm text-gray-500">No commands available</p>
                            ) : (
                                commands.map((command) => (
                                    <label key={command.id} className="flex items-center space-x-2 py-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.commandIds.includes(command.id)}
                                            onChange={() => handleCommandToggle(command.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {command.command_type} - {command.device_id}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                        {formData.commandIds.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.commandIds.length} command(s) selected
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {initialData ? 'Update Group' : 'Create Group'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeviceCommandsPage;