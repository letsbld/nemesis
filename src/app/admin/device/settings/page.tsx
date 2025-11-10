'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Lock,
  Clock,
  Bell,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';

interface SettingConfig {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'number' | 'select';
  value: boolean | number | string;
  options?: string[];
  icon: React.ElementType;
  category: string;
}

const DeviceSettings = () => {
  const [settings, setSettings] = useState<SettingConfig[]>([
    {
      id: 'mfa_required',
      title: 'Require Multi-Factor Authentication',
      description: 'Force all users to enable MFA for device authentication',
      type: 'toggle',
      value: true,
      icon: Shield,
      category: 'Security'
    },
    {
      id: 'passkey_enabled',
      title: 'Enable Passkey Authentication',
      description: 'Allow users to register and use WebAuthn passkeys',
      type: 'toggle',
      value: true,
      icon: Key,
      category: 'Security'
    },
    {
      id: 'max_devices',
      title: 'Maximum Devices Per User',
      description: 'Limit the number of devices a user can register',
      type: 'number',
      value: 5,
      icon: Smartphone,
      category: 'Device Management'
    },
    {
      id: 'session_timeout',
      title: 'Session Timeout (minutes)',
      description: 'Auto-logout users after period of inactivity',
      type: 'number',
      value: 30,
      icon: Clock,
      category: 'Security'
    },
    {
      id: 'device_trust_duration',
      title: 'Device Trust Duration (days)',
      description: 'How long a device remains trusted before re-verification',
      type: 'number',
      value: 90,
      icon: Shield,
      category: 'Device Management'
    },
    {
      id: 'failed_login_attempts',
      title: 'Max Failed Login Attempts',
      description: 'Lock account after this many failed attempts',
      type: 'number',
      value: 5,
      icon: Lock,
      category: 'Security'
    },
    {
      id: 'lockout_duration',
      title: 'Account Lockout Duration (minutes)',
      description: 'How long account remains locked after max failures',
      type: 'number',
      value: 15,
      icon: Lock,
      category: 'Security'
    },
    {
      id: 'new_device_notification',
      title: 'New Device Registration Alerts',
      description: 'Send email notifications when users register new devices',
      type: 'toggle',
      value: true,
      icon: Bell,
      category: 'Notifications'
    },
    {
      id: 'suspicious_activity_alert',
      title: 'Suspicious Activity Alerts',
      description: 'Alert admins when unusual login patterns are detected',
      type: 'toggle',
      value: true,
      icon: AlertTriangle,
      category: 'Notifications'
    },
    {
      id: 'auto_remove_inactive',
      title: 'Auto-Remove Inactive Devices',
      description: 'Automatically remove devices with no activity for extended period',
      type: 'toggle',
      value: false,
      icon: Smartphone,
      category: 'Device Management'
    },
    {
      id: 'inactive_device_threshold',
      title: 'Inactive Device Threshold (days)',
      description: 'Days of inactivity before device is considered inactive',
      type: 'number',
      value: 90,
      icon: Clock,
      category: 'Device Management'
    },
    {
      id: 'enforce_os_updates',
      title: 'Enforce OS Security Updates',
      description: 'Require devices to have latest security patches',
      type: 'toggle',
      value: false,
      icon: Shield,
      category: 'Security'
    },
    {
      id: 'allowed_device_types',
      title: 'Allowed Device Types',
      description: 'Types of devices permitted to access the system',
      type: 'select',
      value: 'all',
      options: ['all', 'desktop-only', 'mobile-only', 'approved-only'],
      icon: Smartphone,
      category: 'Device Management'
    },
    {
      id: 'password_strength',
      title: 'Password Strength Requirement',
      description: 'Minimum password complexity level',
      type: 'select',
      value: 'strong',
      options: ['basic', 'medium', 'strong', 'very-strong'],
      icon: Lock,
      category: 'Security'
    }
  ]);

  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories = Array.from(new Set(settings.map(s => s.category)));

  const handleToggleChange = (id: string) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, value: !setting.value } : setting
    ));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleNumberChange = (id: string, value: number) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, value } : setting
    ));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSelectChange = (id: string, value: string) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, value } : setting
    ));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    // Simulate save
    setTimeout(() => {
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  const handleReset = () => {
    // Reset to defaults - you would fetch from API in real implementation
    setHasChanges(false);
    setSaveSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Settings className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Device Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure device management and security policies
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          {/* Save Success Alert */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
            >
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <span className="text-green-800 dark:text-green-300 font-medium">
                Settings saved successfully!
              </span>
            </motion.div>
          )}

          {/* Unsaved Changes Warning */}
          {hasChanges && !saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3"
            >
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={20} />
              <span className="text-yellow-800 dark:text-yellow-300 font-medium">
                You have unsaved changes
              </span>
            </motion.div>
          )}
        </div>

        {/* Settings by Category */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{category}</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {settings
                  .filter(setting => setting.category === category)
                  .map((setting) => (
                    <motion.div
                      key={setting.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg h-fit">
                            <setting.icon className="text-gray-600 dark:text-gray-400" size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {setting.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {setting.type === 'toggle' && (
                            <button
                              onClick={() => handleToggleChange(setting.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                setting.value
                                  ? 'bg-indigo-600'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          )}
                          {setting.type === 'number' && (
                            <input
                              type="number"
                              value={setting.value as number}
                              onChange={(e) => handleNumberChange(setting.id, parseInt(e.target.value) || 0)}
                              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          )}
                          {setting.type === 'select' && (
                            <select
                              value={setting.value as string}
                              onChange={(e) => handleSelectChange(setting.id, e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent capitalize"
                            >
                              {setting.options?.map(option => (
                                <option key={option} value={option} className="capitalize">
                                  {option.replace('-', ' ')}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
          <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-900 dark:text-blue-300">
            <p className="font-semibold mb-1">Important Notice</p>
            <p>
              Changes to security settings will affect all users and devices in the system. 
              Make sure to review and test configurations before applying to production environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettings;
