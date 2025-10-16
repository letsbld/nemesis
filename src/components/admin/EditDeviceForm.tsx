'use client';

import React, { useState, useEffect } from 'react';
import { DeviceData, CreateDeviceData } from '@/types/admin.types';

interface EditDeviceFormProps {
    device: DeviceData;
    onSubmit: (deviceData: Partial<CreateDeviceData>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export function EditDeviceForm({ device, onSubmit, onCancel, isLoading }: EditDeviceFormProps) {
    const [formData, setFormData] = useState<Partial<CreateDeviceData>>({
        device_id: '',
        device_name: '',
        os_version: '',
        hardware_model: '',
        serial_number: '',
        mac_address: '',
        agent_version: '',
    });

    useEffect(() => {
        // Initialize form with device data
        setFormData({
            device_id: device.device_id,
            device_name: device.device_name,
            os_version: device.os_version,
            hardware_model: device.hardware_model,
            serial_number: device.serial_number,
            mac_address: device.mac_address,
            agent_version: device.agent_version,
        });
    }, [device]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Device</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Device ID *
                            </label>
                            <input
                                type="text"
                                name="device_id"
                                value={formData.device_id || ''}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="e.g., dev-001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Device Name *
                            </label>
                            <input
                                type="text"
                                name="device_name"
                                value={formData.device_name || ''}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="e.g., Laptop 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                OS Version *
                            </label>
                            <input
                                type="text"
                                name="os_version"
                                value={formData.os_version || ''}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="e.g., Windows 11"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hardware Model *
                            </label>
                            <input
                                type="text"
                                name="hardware_model"
                                value={formData.hardware_model || ''}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="e.g., Dell XPS 13"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Serial Number *
                            </label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number || ''}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="e.g., SN123456"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                MAC Address *
                            </label>
                            <input
                                type="text"
                                name="mac_address"
                                value={formData.mac_address || ''}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Agent Version *
                            </label>
                            <input
                                type="text"
                                name="agent_version"
                                value={formData.agent_version || ''}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="e.g., 1.0.0"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Updating...' : 'Update Device'}
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
        </div>
    );
}
