import React, { useState, useEffect } from 'react';
import { CreateDeviceCommandData, DeviceData } from '@/types/admin.types';

interface CreateDeviceCommandFormProps {
    onSubmit: (data: CreateDeviceCommandData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    devices?: DeviceData[];
    initialData?: Partial<CreateDeviceCommandData>;
}

export const CreateDeviceCommandForm: React.FC<CreateDeviceCommandFormProps> = ({
    onSubmit,
    onCancel,
    isLoading = false,
    devices = [],
    initialData
}) => {
    const [formData, setFormData] = useState<CreateDeviceCommandData>({
        device_id: '',
        command_type: 'reboot',
        command_payload: { delay: 5 }
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePayloadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            command_payload: {
                ...prev.command_payload,
                [name]: value
            }
        }));
    };

    const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const delay = parseInt(e.target.value) || 0;
        setFormData(prev => ({
            ...prev,
            command_payload: {
                ...prev.command_payload,
                delay
            }
        }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {initialData ? 'Edit Device Command' : 'Create Device Command'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device *
                        </label>
                        {devices.length > 0 ? (
                            <select
                                name="device_id"
                                value={formData.device_id}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select a device</option>
                                {devices.map((device) => (
                                    <option key={device.id} value={device.id}>
                                        {device.device_name} ({device.device_id})
                                    </option>
                                ))}
                            </select>
                        ) : (
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
                        )}
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
                            <option value="hibernate">Hibernate</option>
                            <option value="sleep">Sleep</option>
                            <option value="restart">Restart Service</option>
                            <option value="backup">Backup</option>
                        </select>
                    </div>
                </div>

                {/* Command-specific payload fields */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Command Parameters</h4>

                    {formData.command_type === 'reboot' || formData.command_type === 'shutdown' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Delay (seconds)
                                </label>
                                <input
                                    type="number"
                                    name="delay"
                                    value={formData.command_payload.delay || 0}
                                    onChange={handleDelayChange}
                                    min="0"
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Force
                                </label>
                                <select
                                    name="force"
                                    value={formData.command_payload.force || 'false'}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        command_payload: {
                                            ...prev.command_payload,
                                            force: e.target.value === 'true'
                                        }
                                    }))}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                        </div>
                    ) : formData.command_type === 'update' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Component
                                </label>
                                <input
                                    type="text"
                                    name="component"
                                    value={formData.command_payload.component || ''}
                                    onChange={handlePayloadChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    placeholder="e.g., agent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Version
                                </label>
                                <input
                                    type="text"
                                    name="version"
                                    value={formData.command_payload.version || ''}
                                    onChange={handlePayloadChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    placeholder="e.g., 1.2.0"
                                />
                            </div>
                        </div>
                    ) : formData.command_type === 'scan' ? (
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Scan Type
                                </label>
                                <select
                                    name="scanType"
                                    value={formData.command_payload.scanType || 'full'}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        command_payload: {
                                            ...prev.command_payload,
                                            scanType: e.target.value
                                        }
                                    }))}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="full">Full Scan</option>
                                    <option value="quick">Quick Scan</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            {formData.command_payload.scanType === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Custom Paths
                                    </label>
                                    <input
                                        type="text"
                                        name="paths"
                                        value={formData.command_payload.paths || ''}
                                        onChange={handlePayloadChange}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="e.g., /home,/tmp"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            No additional parameters required for this command type.
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : (initialData ? 'Update Command' : 'Create Command')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
