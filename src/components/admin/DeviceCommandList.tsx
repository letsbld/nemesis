import React from 'react';
import { Play, Edit, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DeviceCommandData } from '@/types/admin.types';

interface DeviceCommandListProps {
    commands: DeviceCommandData[];
    onExecuteCommand?: (commandId: string) => void;
    onEditCommand?: (command: DeviceCommandData) => void;
    onDeleteCommand?: (commandId: string) => void;
    isLoading?: boolean;
    isExecuting?: string | null;
    searchQuery?: string;
    statusFilter?: string;
}

export const DeviceCommandList: React.FC<DeviceCommandListProps> = ({
    commands,
    onExecuteCommand,
    onEditCommand,
    onDeleteCommand,
    isLoading = false,
    isExecuting = null,
    searchQuery = '',
    statusFilter = 'all'
}) => {
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

    const filteredCommands = commands.filter(command => {
        const matchesSearch = (command.device_id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                             (command.command_type?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || command.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (filteredCommands.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        {commands.length === 0 ? 'No commands found' : 'No commands match the current filters'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
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
                                Payload
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
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="max-w-xs truncate">
                                        {command.command_payload ? JSON.stringify(command.command_payload) : '{}'}
                                    </div>
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
                                        {(command.status || 'pending') === 'pending' && onExecuteCommand && (
                                            <button
                                                onClick={() => onExecuteCommand(command.id)}
                                                disabled={isExecuting === command.id}
                                                className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Execute Command"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}
                                        {onEditCommand && (
                                            <button
                                                onClick={() => onEditCommand(command)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit Command"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                        {onDeleteCommand && (
                                            <button
                                                onClick={() => onDeleteCommand(command.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Command"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
