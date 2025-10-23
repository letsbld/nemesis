'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Download, Settings, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { DeviceData, CreateDeviceData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { DeviceList } from '@/components/admin/DeviceList';
import { CreateDeviceForm } from '@/components/admin/CreateDeviceForm';
import { EditDeviceForm } from '@/components/admin/EditDeviceForm';
import toast from 'react-hot-toast';
import { Commet } from 'react-loading-indicators';

// Types for the overview data
interface DeviceStats {
    total: number;
    online: number;
    offline: number;
    added: number;
    deleted: number;
    patched: number;
}

interface FleetDistribution {
    macOS: number;
    windows: number;
    linux: number;
    other: number;
}

interface ActivityEvent {
    id: string;
    eventType: string;
    timestamp: string;
    hostname: string;
    details: string;
    status: 'success' | 'warning' | 'error';
}


// Component that uses useSearchParams - needs to be wrapped in Suspense
const DeviceOverviewContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [devices, setDevices] = useState<DeviceData[]>([]);
    const [stats, setStats] = useState<DeviceStats>({
        total: 0,
        online: 0,
        offline: 0,
        added: 25,
        deleted: 24,
        patched: 1781
    });
    const [fleetDistribution, setFleetDistribution] = useState<FleetDistribution>({
        macOS: 103,
        windows: 149,
        linux: 0,
        other: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'attention'>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Device management state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingDevice, setEditingDevice] = useState<DeviceData | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Check authentication and admin role
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

    // Handle tab query parameter
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'devices') {
            setActiveTab('devices');
        }
    }, [searchParams]);

    // Fetch devices data
    useEffect(() => {
        fetchDevices();
        fetchRecentActivity();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await apiFetch('/device');
            const devicesArray = response && response.devices ? response.devices : [];
            setDevices(Array.isArray(devicesArray) ? devicesArray : []);

            // Calculate stats from devices
            const total = devicesArray.length;
            const online = devicesArray.filter((d: DeviceData) => d.status === 'online').length;
            setStats(prev => ({
                ...prev,
                total,
                online,
                offline: total - online
            }));

            // Calculate OS distribution
            const macOS = devicesArray.filter((d: DeviceData) => d.os_version?.toLowerCase().includes('macos') || d.os_version?.toLowerCase().includes('darwin')).length;
            const windows = devicesArray.filter((d: DeviceData) => d.os_version?.toLowerCase().includes('windows')).length;
            setFleetDistribution({
                macOS,
                windows,
                linux: devicesArray.filter((d: DeviceData) => d.os_version?.toLowerCase().includes('linux')).length,
                other: total - macOS - windows
            });

        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecentActivity = async () => {
        // Mock data for now - replace with actual API call
        const mockActivity: ActivityEvent[] = [
            {
                id: '1',
                eventType: 'OS major upgrade',
                timestamp: '44 minutes ago',
                hostname: 'DESKTOP-1CVA8Q9',
                details: 'Windows major upgrade to version 262',
                status: 'success'
            },
            {
                id: '2',
                eventType: 'Device enrolled',
                timestamp: '2 hours ago',
                hostname: 'MacBook-Pro-123',
                details: 'New macOS device enrolled',
                status: 'success'
            },
            {
                id: '3',
                eventType: 'Policy violation',
                timestamp: '3 hours ago',
                hostname: 'WIN-DESKTOP-456',
                details: 'Unauthorized USB device detected',
                status: 'warning'
            }
        ];
        setRecentActivity(mockActivity);
    };


    const handleCreateDevice = async (deviceData: CreateDeviceData) => {
        setIsCreating(true);
        try {
            const response = await apiFetch('/device', {
                method: 'POST',
                body: JSON.stringify(deviceData),
                headers: { 'Content-Type': 'application/json' },
            });
            // Handle API response: check if response has device or data property
            const newDevice = response && (response.device || response.data || response);
            if (newDevice && typeof newDevice === 'object') {
                setDevices((prev) => [...prev, newDevice]);
                // Update stats
                setStats(prev => ({
                    ...prev,
                    total: prev.total + 1,
                    online: prev.online + (newDevice.status === 'online' ? 1 : 0),
                    offline: prev.offline + (newDevice.status === 'online' ? 0 : 1)
                }));
            }
            setShowCreateForm(false);
            toast.success('Device created successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to create device.'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateDevice = async (deviceId: string, deviceData: Partial<CreateDeviceData>) => {
        setIsUpdating(true);
        try {
            const response = await apiFetch(`/device/${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify(deviceData),
                headers: { 'Content-Type': 'application/json' },
            });
            // Handle API response: check if response has device or data property
            const updatedDevice = response && (response.device || response.data || response);
            if (updatedDevice && typeof updatedDevice === 'object') {
                setDevices((prev) => prev.map((device) => (device.id === deviceId ? updatedDevice : device)));
                // Update stats if status changed
                const oldDevice = devices.find(d => d.id === deviceId);
                if (oldDevice && oldDevice.status !== updatedDevice.status) {
                    setStats(prev => ({
                        ...prev,
                        online: updatedDevice.status === 'online' ? prev.online + 1 : prev.online - 1,
                        offline: updatedDevice.status === 'online' ? prev.offline - 1 : prev.offline + 1
                    }));
                }
            }
            setShowEditForm(false);
            setEditingDevice(null);
            toast.success('Device updated successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to update device.'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteDevice = async (deviceId: string) => {
        if (!confirm('Are you sure you want to delete this device?')) {
            return;
        }
        try {
            await apiFetch(`/device/${deviceId}`, { method: 'DELETE' });
            const deletedDevice = devices.find(d => d.id === deviceId);
            setDevices((prev) => prev.filter((device) => device.id !== deviceId));
            // Update stats
            if (deletedDevice) {
                setStats(prev => ({
                    ...prev,
                    total: prev.total - 1,
                    online: deletedDevice.status === 'online' ? prev.online - 1 : prev.online,
                    offline: deletedDevice.status === 'online' ? prev.offline : prev.offline - 1
                }));
            }
            toast.success('Device deleted successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to delete device.'}`);
        }
    };

    const handleEditDevice = (device: DeviceData) => {
        setEditingDevice(device);
        setShowEditForm(true);
    };



    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-600 bg-green-50';
            case 'warning':
                return 'text-yellow-600 bg-yellow-50';
            case 'error':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-6">
                <Commet color="#318bcc" size="small" text="" textColor="" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stats.total} devices
                    </span>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search with AI"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Filters</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'overview', label: 'Overview', active: activeTab === 'overview' },
                        { id: 'devices', label: 'Devices', active: activeTab === 'devices' },
                        { id: 'attention', label: 'Needs Attention', active: activeTab === 'attention' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                // Update URL without causing a page reload
                                const url = new URL(window.location.href);
                                if (tab.id === 'overview') {
                                    url.searchParams.delete('tab');
                                } else {
                                    url.searchParams.set('tab', tab.id);
                                }
                                window.history.replaceState({}, '', url.toString());
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                tab.active
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-semibold text-gray-900">{stats.added}</div>
                                    <div className="text-sm text-gray-500">Added</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-8 w-8 text-red-500" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-semibold text-gray-900">{stats.deleted}</div>
                                    <div className="text-sm text-gray-500">Deleted</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-8 w-8 text-blue-500" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-semibold text-gray-900">{stats.patched}</div>
                                    <div className="text-sm text-gray-500">Patched</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fleet Distribution and Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fleet Distribution */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Fleet distribution</h3>
                                <Activity className="h-5 w-5 text-gray-400" />
                            </div>

                            {/* Donut Chart Placeholder */}
                            <div className="flex items-center justify-center h-48">
                                <div className="relative w-32 h-32">
                                    {/* SVG Donut Chart */}
                                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 42 42">
                                        {/* Background circle */}
                                        <circle
                                            cx="21"
                                            cy="21"
                                            r="15.915494309"
                                            fill="transparent"
                                            stroke="#e5e7eb"
                                            strokeWidth="3"
                                        />
                                        {/* macOS slice */}
                                        {fleetDistribution.macOS > 0 && (
                                            <circle
                                                cx="21"
                                                cy="21"
                                                r="15.915494309"
                                                fill="transparent"
                                                stroke="#8b5cf6"
                                                strokeWidth="3"
                                                strokeDasharray={`${(fleetDistribution.macOS / stats.total) * 100} ${100}`}
                                                strokeDashoffset="0"
                                            />
                                        )}
                                        {/* Windows slice */}
                                        {fleetDistribution.windows > 0 && (
                                            <circle
                                                cx="21"
                                                cy="21"
                                                r="15.915494309"
                                                fill="transparent"
                                                stroke="#06b6d4"
                                                strokeWidth="3"
                                                strokeDasharray={`${(fleetDistribution.windows / stats.total) * 100} ${100}`}
                                                strokeDashoffset={`${-(fleetDistribution.macOS / stats.total) * 100}`}
                                            />
                                        )}
                                    </svg>
                                    {/* Center text */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-900">{stats.total}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                        <span className="text-sm text-gray-600">macOS: {fleetDistribution.macOS} ({Math.round(fleetDistribution.macOS / stats.total * 100)}%)</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                                        <span className="text-sm text-gray-600">Windows: {fleetDistribution.windows} ({Math.round(fleetDistribution.windows / stats.total * 100)}%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Log */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Activity</h3>
                                <div className="flex items-center space-x-2">
                                    <select className="text-sm border border-gray-300 rounded px-2 py-1">
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                        <option>Last 90 Days</option>
                                    </select>
                                    <Link
                                        href="/admin/device/activity"
                                        className="text-sm text-blue-600 hover:text-blue-500"
                                    >
                                        View Activity Log
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {recentActivity.map((event) => (
                                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getStatusIcon(event.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900">{event.eventType}</p>
                                                <p className="text-xs text-gray-500">{event.timestamp}</p>
                                            </div>
                                            <p className="text-sm text-gray-600">{event.hostname}</p>
                                            <p className="text-xs text-gray-500 mt-1">{event.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                href="/admin/device/overview?tab=devices"
                                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Settings className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-900">Manage Devices</span>
                            </Link>
                            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Download className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-900">Export Report</span>
                            </button>
                            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-900">View Alerts</span>
                            </button>
                            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Settings className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-900">Device Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
                <div className="space-y-6">
                    <DeviceList
                        devices={devices}
                        onCreateDevice={() => setShowCreateForm(true)}
                        onDeleteDevice={handleDeleteDevice}
                        onEditDevice={handleEditDevice}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Attention Tab */}
            {activeTab === 'attention' && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Devices needing attention view - to be implemented...</p>
                </div>
            )}

            {/* Create Device Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <CreateDeviceForm
                            onSubmit={handleCreateDevice}
                            onCancel={() => setShowCreateForm(false)}
                            isLoading={isCreating}
                        />
                    </div>
                </div>
            )}

            {/* Edit Device Modal */}
            {showEditForm && editingDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <EditDeviceForm
                            device={editingDevice}
                            onSubmit={(deviceData) => handleUpdateDevice(editingDevice.id, deviceData)}
                            onCancel={() => {
                                setShowEditForm(false);
                                setEditingDevice(null);
                            }}
                            isLoading={isUpdating}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

// Main component that wraps the content in Suspense
const DeviceOverviewPage = () => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading device overview...</div>
            </div>
        }>
            <DeviceOverviewContent />
        </Suspense>
    );
};

export default DeviceOverviewPage;