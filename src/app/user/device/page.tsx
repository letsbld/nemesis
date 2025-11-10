'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  CheckCircle,
  Clock,
  MapPin,
  Chrome,
  Calendar,
  Shield,
  Trash2,
  LogOut,
  Info,
  AlertCircle,
  Globe,
  Wifi
} from 'lucide-react';

type DeviceType = 'desktop' | 'mobile' | 'tablet';
type DeviceStatus = 'active' | 'inactive';

interface Device {
  id: number;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  lastActive: string;
  location: string;
  browser: string;
  os: string;
  ipAddress: string;
  isCurrent: boolean;
  registered: string;
}

const DUMMY_DEVICES: Device[] = [
  {
    id: 1,
    name: "MacBook Pro (Current)",
    type: "desktop",
    status: "active",
    lastActive: "2025-11-10T14:30:00Z",
    location: "San Francisco, CA",
    browser: "Chrome 119",
    os: "macOS Sonoma 14.1",
    ipAddress: "192.168.1.45",
    isCurrent: true,
    registered: "2025-09-15T08:00:00Z"
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    type: "mobile",
    status: "active",
    lastActive: "2025-11-10T13:15:00Z",
    location: "San Francisco, CA",
    browser: "Safari Mobile",
    os: "iOS 17.1",
    ipAddress: "192.168.1.78",
    isCurrent: false,
    registered: "2025-09-20T10:30:00Z"
  },
  {
    id: 3,
    name: "iPad Air",
    type: "tablet",
    status: "active",
    lastActive: "2025-11-09T20:45:00Z",
    location: "San Francisco, CA",
    browser: "Safari",
    os: "iPadOS 17.1",
    ipAddress: "192.168.1.92",
    isCurrent: false,
    registered: "2025-10-01T14:00:00Z"
  },
  {
    id: 4,
    name: "Windows Desktop",
    type: "desktop",
    status: "active",
    lastActive: "2025-11-08T16:20:00Z",
    location: "San Francisco, CA",
    browser: "Edge 119",
    os: "Windows 11",
    ipAddress: "192.168.1.120",
    isCurrent: false,
    registered: "2025-08-10T09:00:00Z"
  },
  {
    id: 5,
    name: "Samsung Galaxy S23",
    type: "mobile",
    status: "inactive",
    lastActive: "2025-10-25T11:30:00Z",
    location: "Oakland, CA",
    browser: "Chrome Mobile",
    os: "Android 14",
    ipAddress: "192.168.50.33",
    isCurrent: false,
    registered: "2025-07-05T12:00:00Z"
  }
];

const DevicePage = () => {
  const [devices, setDevices] = useState<Device[]>(DUMMY_DEVICES);
  const [showRemoveModal, setShowRemoveModal] = useState<number | null>(null);

  const getDeviceIcon = (type: DeviceType) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'desktop':
        return <Monitor className={iconClass} />;
      case 'mobile':
        return <Smartphone className={iconClass} />;
      case 'tablet':
        return <Tablet className={iconClass} />;
      default:
        return <Laptop className={iconClass} />;
    }
  };

  const getStatusBadge = (status: DeviceStatus) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
          <CheckCircle size={12} />
          Active
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs font-medium">
        <Clock size={12} />
        Inactive
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRemoveDevice = (id: number) => {
    setDevices(devices.filter(device => device.id !== id));
    setShowRemoveModal(null);
  };

  const handleLogoutDevice = (id: number) => {
    setDevices(devices.map(device => 
      device.id === id ? { ...device, status: 'inactive' as DeviceStatus } : device
    ));
  };

  const activeDevices = devices.filter(d => d.status === 'active').length;
  const totalDevices = devices.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Laptop className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Devices</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage devices connected to your account
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalDevices}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Laptop className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Devices</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{activeDevices}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Devices</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{totalDevices - activeDevices}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Clock className="text-gray-600 dark:text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Devices List */}
        <div className="space-y-4">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      device.isCurrent 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {device.name}
                        </h3>
                        {getStatusBadge(device.status)}
                        {device.isCurrent && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock size={14} />
                          <span>Last active: {formatDate(device.lastActive)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin size={14} />
                          <span>{device.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Chrome size={14} />
                          <span>{device.browser}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Monitor size={14} />
                          <span>{device.os}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Wifi size={14} />
                          <span>IP: {device.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar size={14} />
                          <span>Registered: {formatDate(device.registered)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!device.isCurrent && (
                    <div className="flex items-center gap-2">
                      {device.status === 'active' && (
                        <button
                          onClick={() => handleLogoutDevice(device.id)}
                          className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors group"
                          title="Logout from this device"
                        >
                          <LogOut size={20} className="text-orange-600 dark:text-orange-400" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowRemoveModal(device.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                        title="Remove device"
                      >
                        <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>

                {device.isCurrent && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Info size={16} className="flex-shrink-0 mt-0.5" />
                      <p>This is your current device. You cannot remove or logout from it.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex gap-3">
            <Shield className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
            <div className="text-sm text-yellow-900 dark:text-yellow-300">
              <p className="font-semibold mb-1">Security Tips</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-400">
                <li>Regularly review and remove devices you no longer use</li>
                <li>If you see an unfamiliar device, remove it immediately and change your password</li>
                <li>Use strong, unique passwords and enable multi-factor authentication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {devices.length === 0 && (
          <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Laptop className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Devices Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You don't have any registered devices yet
            </p>
          </div>
        )}

        {/* Remove Device Modal */}
        {showRemoveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#1a2332] rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Remove Device</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to remove this device? This action will log out the device and it will need to sign in again.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRemoveModal(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveDevice(showRemoveModal)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Remove Device
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicePage;