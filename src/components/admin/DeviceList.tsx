'use client';

import { DeviceData } from '@/types/admin.types';
import CustomButton from '@/components/ui/customButton';
import { formatDate } from '@/lib/date-utils';
import { useRouter } from 'next/navigation';

interface DeviceListProps {
    devices: DeviceData[];
    onCreateDevice: () => void;
    onDeleteDevice: (deviceId: string) => Promise<void>;
    onEditDevice?: (device: DeviceData) => void;
    isLoading: boolean;
}

export function DeviceList({
    devices,
    onCreateDevice,
    onDeleteDevice,
    onEditDevice,
    isLoading = false,
}: DeviceListProps) {
    const handleEditDevice = (device: DeviceData) => {
        if (onEditDevice) {
            onEditDevice(device);
        }
    };

    const handleDeleteClick = async (deviceId: string) => {
        try {
            await onDeleteDevice(deviceId);
        } catch (error) {
            console.error('Error in delete handler:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Device Management</h1>
                <div className="flex gap-3">
                    <CustomButton
                        name="Create New Device"
                        onClick={onCreateDevice}
                        btnType="button"
                        style="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                        loading={isLoading}
                    />
                </div>
            </div>

            {!Array.isArray(devices) || devices.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">
                        {!Array.isArray(devices) ? 'Error loading devices' : 'No devices found'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <CustomButton
                            name="Create First Device"
                            onClick={onCreateDevice}
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
                                    Device ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Device Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    OS Version
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hardware Model
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Serial Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    MAC Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Agent Version
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Users
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
                            {devices.map((device) => (
                                <tr key={device.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {device.device_id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {device.device_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {device.os_version}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {device.hardware_model}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {device.serial_number}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {device.mac_address}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {device.agent_version}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            device.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {device.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {device.users && device.users.length > 0
                                                ? `${device.users.length} user${device.users.length > 1 ? 's' : ''}`
                                                : 'No users'
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(device.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-900 px-2 py-1"
                                                onClick={() => handleEditDevice(device)}
                                                disabled={isLoading}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-900 px-2 py-1"
                                                onClick={() => handleDeleteClick(device.id)}
                                                disabled={isLoading}
                                            >
                                                Delete
                                            </button>
                                        </div>
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
