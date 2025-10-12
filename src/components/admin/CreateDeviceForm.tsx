'use client';

import { useState } from 'react';
import CustomButton from '@/components/ui/customButton';
import { CreateDeviceData } from '@/types/admin.types';

interface CreateDeviceFormProps {
    onSubmit: (deviceData: CreateDeviceData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function CreateDeviceForm({ onSubmit, onCancel, isLoading = false }: CreateDeviceFormProps) {
    const [formData, setFormData] = useState({
        device_id: '',
        device_name: '',
        os_version: '',
        hardware_model: '',
        serial_number: '',
        mac_address: '',
        agent_version: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (!formData.device_id) newErrors.device_id = 'Device ID is required';
        if (!formData.device_name) newErrors.device_name = 'Device name is required';
        if (!formData.os_version) newErrors.os_version = 'OS version is required';
        if (!formData.hardware_model) newErrors.hardware_model = 'Hardware model is required';
        if (!formData.serial_number) newErrors.serial_number = 'Serial number is required';
        if (!formData.mac_address) newErrors.mac_address = 'MAC address is required';
        if (!formData.agent_version) newErrors.agent_version = 'Agent version is required';

        // MAC address validation (basic format check)
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (formData.mac_address && !macRegex.test(formData.mac_address)) {
            newErrors.mac_address = 'Invalid MAC address format (use XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Device</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Device ID and Device Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Device ID *</label>
                        <input
                            type="text"
                            name="device_id"
                            value={formData.device_id}
                            onChange={handleChange}
                            placeholder="e.g., dev-001"
                            className={`w-full p-2 border rounded-md ${
                                errors.device_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.device_id && (
                            <p className="text-red-500 text-xs mt-1">{errors.device_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Device Name *</label>
                        <input
                            type="text"
                            name="device_name"
                            value={formData.device_name}
                            onChange={handleChange}
                            placeholder="e.g., Laptop 1"
                            className={`w-full p-2 border rounded-md ${
                                errors.device_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.device_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.device_name}</p>
                        )}
                    </div>
                </div>

                {/* OS Version and Hardware Model */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">OS Version *</label>
                        <input
                            type="text"
                            name="os_version"
                            value={formData.os_version}
                            onChange={handleChange}
                            placeholder="e.g., Windows 11"
                            className={`w-full p-2 border rounded-md ${
                                errors.os_version ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.os_version && (
                            <p className="text-red-500 text-xs mt-1">{errors.os_version}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Hardware Model *</label>
                        <input
                            type="text"
                            name="hardware_model"
                            value={formData.hardware_model}
                            onChange={handleChange}
                            placeholder="e.g., Dell XPS 13"
                            className={`w-full p-2 border rounded-md ${
                                errors.hardware_model ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.hardware_model && (
                            <p className="text-red-500 text-xs mt-1">{errors.hardware_model}</p>
                        )}
                    </div>
                </div>

                {/* Serial Number and MAC Address */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Serial Number *</label>
                        <input
                            type="text"
                            name="serial_number"
                            value={formData.serial_number}
                            onChange={handleChange}
                            placeholder="e.g., SN123456"
                            className={`w-full p-2 border rounded-md ${
                                errors.serial_number ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.serial_number && (
                            <p className="text-red-500 text-xs mt-1">{errors.serial_number}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">MAC Address *</label>
                        <input
                            type="text"
                            name="mac_address"
                            value={formData.mac_address}
                            onChange={handleChange}
                            placeholder="e.g., 00:1A:2B:3C:4D:5E"
                            className={`w-full p-2 border rounded-md ${
                                errors.mac_address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.mac_address && (
                            <p className="text-red-500 text-xs mt-1">{errors.mac_address}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
                        </p>
                    </div>
                </div>

                {/* Agent Version */}
                <div>
                    <label className="block text-sm font-medium mb-1">Agent Version *</label>
                    <input
                        type="text"
                        name="agent_version"
                        value={formData.agent_version}
                        onChange={handleChange}
                        placeholder="e.g., 1.0.0"
                        className={`w-full p-2 border rounded-md ${
                            errors.agent_version ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                    />
                    {errors.agent_version && (
                        <p className="text-red-500 text-xs mt-1">{errors.agent_version}</p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <CustomButton
                        name={isLoading ? 'Creating...' : 'Create Device'}
                        btnType="submit"
                        style="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        loading={isLoading}
                    />
                    <CustomButton
                        name="Cancel"
                        btnType="button"
                        onClick={onCancel}
                        style="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
                    />
                </div>
            </form>
        </div>
    );
}
