'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { DeviceData, CreateDeviceData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { Loader } from '@/components/ui/loader';



const EditDevicePage = () => {
    const router = useRouter();
    const params = useParams();
    const [deviceId, setDeviceId] = useState<string | null>(null);

    const [device, setDevice] = useState<DeviceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateDeviceData>>({
        device_id: '',
        device_name: '',
        os_version: '',
        hardware_model: '',
        serial_number: '',
        mac_address: '',
        agent_version: '',
    });

    // Auth state
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
        'loading'
    );
    const [authUser, setAuthUser] = useState<any>(null);

    // Extract deviceId from params
    useEffect(() => {
        if (params?.id) {
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            setDeviceId(id);
        }
    }, [params]);

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');

        if (!token || !userStr) {
            setAuthStatus('unauthenticated');
            router.push('/auth/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(userStr);
            setAuthUser(parsedUser);
            if (parsedUser.role !== 'admin') {
                setAuthStatus('unauthenticated');
                if (parsedUser.role === 'user') {
                    router.push('/home');
                } else {
                    router.push('/auth/login');
                }
                return;
            }
            setAuthStatus('authenticated');
        } catch {
            setAuthStatus('unauthenticated');
            router.push('/auth/login');
        }
    }, [router]);

    // Fetch device data
    useEffect(() => {
        if (deviceId && authStatus === 'authenticated' && authUser && authUser.role === 'admin') {
            fetchDevice();
        }
    }, [deviceId, authStatus, authUser]);

    const fetchDevice = async () => {
        if (!deviceId) return;

        setIsLoading(true);
        try {
            const response = await apiFetch(`/device/${deviceId}`);
            // Handle API response: check if response has device or data property
            const deviceData = response && (response.device || response.data || response);
            if (deviceData && typeof deviceData === 'object') {
                setDevice(deviceData);
                setFormData({
                    device_id: deviceData.device_id || '',
                    device_name: deviceData.device_name || '',
                    os_version: deviceData.os_version || '',
                    hardware_model: deviceData.hardware_model || '',
                    serial_number: deviceData.serial_number || '',
                    mac_address: deviceData.mac_address || '',
                    agent_version: deviceData.agent_version || '',
                });
            } else {
                throw new Error('Invalid device data received');
            }
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to fetch device data.'}`);
            router.push('/admin/device/overview?tab=devices');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deviceId) return;

        setIsSaving(true);

        try {
            await apiFetch(`/device/${deviceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            toast.success('Device updated successfully!');
            router.push('/admin/device/overview?tab=devices');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to update device.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state
    if (authStatus === 'loading' || isLoading || !deviceId) {
        return (
           <div className="flex justify-center py-6">
                <Loader />
            </div>
        );
    }

    // Show redirecting state if not admin
    if (authStatus !== 'authenticated' || !authUser || authUser.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    if (!device) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Device not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Edit Device: {device.device_name}
                        </h2>
                        <button
                            onClick={() => router.push('/admin/device/overview/devices')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Back to Devices
                        </button>
                    </div>

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
                                    disabled={isSaving}
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
                                    disabled={isSaving}
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
                                    disabled={isSaving}
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
                                    disabled={isSaving}
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
                                    disabled={isSaving}
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
                                    disabled={isSaving}
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
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    placeholder="e.g., 1.0.0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Updating...' : 'Update Device'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/admin/device/overview/devices')}
                                disabled={isSaving}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDevicePage;
