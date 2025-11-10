'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Filter, 
  Download, 
  Search,
  ChevronDown,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw
} from 'lucide-react';

type LogLevel = 'info' | 'warning' | 'error' | 'success';
type DeviceType = 'desktop' | 'mobile' | 'tablet';

interface DeviceLog {
  id: number;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  userId: string;
  userName: string;
  action: string;
  level: LogLevel;
  ipAddress: string;
  location: string;
  details: string;
  browser?: string;
  os?: string;
}

const DUMMY_LOGS: DeviceLog[] = [
  {
    id: 1,
    timestamp: '2025-11-10T10:30:15Z',
    deviceId: 'DEV-WIN-8472',
    deviceName: 'John\'s Workstation',
    deviceType: 'desktop',
    userId: 'USR-001',
    userName: 'John Doe',
    action: 'Device Authentication Success',
    level: 'success',
    ipAddress: '192.168.1.105',
    location: 'New York, USA',
    details: 'User successfully authenticated using passkey. Session established.',
    browser: 'Chrome 119',
    os: 'Windows 11 Pro'
  },
  {
    id: 2,
    timestamp: '2025-11-10T10:25:42Z',
    deviceId: 'DEV-MAC-3291',
    deviceName: 'Sarah\'s MacBook Pro',
    deviceType: 'desktop',
    userId: 'USR-023',
    userName: 'Sarah Mitchell',
    action: 'Failed Login Attempt',
    level: 'error',
    ipAddress: '192.168.1.87',
    location: 'San Francisco, USA',
    details: 'Authentication failed. Incorrect TOTP code entered. Attempt 2 of 5.',
    browser: 'Safari 17.1',
    os: 'macOS Sonoma 14.1'
  },
  {
    id: 3,
    timestamp: '2025-11-10T10:18:33Z',
    deviceId: 'DEV-IPH-5629',
    deviceName: 'Emily\'s iPhone 15',
    deviceType: 'mobile',
    userId: 'USR-045',
    userName: 'Emily Rodriguez',
    action: 'Password Manager Access',
    level: 'info',
    ipAddress: '10.0.0.234',
    location: 'Chicago, USA',
    details: 'User accessed password vault and retrieved 3 credentials.',
    browser: 'Safari Mobile',
    os: 'iOS 17.1'
  },
  {
    id: 4,
    timestamp: '2025-11-10T10:12:08Z',
    deviceId: 'DEV-AND-7841',
    deviceName: 'Michael\'s Galaxy S23',
    deviceType: 'mobile',
    userId: 'USR-067',
    userName: 'Michael Chen',
    action: 'Suspicious Activity Detected',
    level: 'warning',
    ipAddress: '203.0.113.42',
    location: 'Unknown Location',
    details: 'Login attempt from unrecognized location. Multi-factor authentication required.',
    browser: 'Chrome Mobile 119',
    os: 'Android 14'
  },
  {
    id: 5,
    timestamp: '2025-11-10T10:05:19Z',
    deviceId: 'DEV-TAB-9123',
    deviceName: 'Marketing iPad Pro',
    deviceType: 'tablet',
    userId: 'USR-089',
    userName: 'Lisa Anderson',
    action: 'Device Registration',
    level: 'success',
    ipAddress: '192.168.1.201',
    location: 'Boston, USA',
    details: 'New device successfully registered. WebAuthn credentials stored.',
    browser: 'Safari iPad',
    os: 'iPadOS 17.1'
  },
  {
    id: 6,
    timestamp: '2025-11-10T09:58:47Z',
    deviceId: 'DEV-WIN-3345',
    deviceName: 'David\'s Desktop',
    deviceType: 'desktop',
    userId: 'USR-012',
    userName: 'David Brown',
    action: 'Data Export Blocked',
    level: 'warning',
    ipAddress: '192.168.1.156',
    location: 'Seattle, USA',
    details: 'Attempted to export sensitive credential data. Action blocked by DLP policy.',
    browser: 'Firefox 120',
    os: 'Windows 10 Enterprise'
  },
  {
    id: 7,
    timestamp: '2025-11-10T09:45:22Z',
    deviceId: 'DEV-MAC-6677',
    deviceName: 'IT Admin MacBook',
    deviceType: 'desktop',
    userId: 'USR-003',
    userName: 'Admin User',
    action: 'Security Settings Updated',
    level: 'info',
    ipAddress: '192.168.1.10',
    location: 'Austin, USA',
    details: 'Password policy updated. Minimum length increased to 12 characters.',
    browser: 'Chrome 119',
    os: 'macOS Ventura 13.6'
  },
  {
    id: 8,
    timestamp: '2025-11-10T09:32:11Z',
    deviceId: 'DEV-IPH-8844',
    deviceName: 'James\'s iPhone 14',
    deviceType: 'mobile',
    userId: 'USR-034',
    userName: 'James Wilson',
    action: 'Session Timeout',
    level: 'info',
    ipAddress: '10.0.0.156',
    location: 'Miami, USA',
    details: 'User session expired after 30 minutes of inactivity. Re-authentication required.',
    browser: 'Safari Mobile',
    os: 'iOS 16.7'
  },
  {
    id: 9,
    timestamp: '2025-11-10T09:20:05Z',
    deviceId: 'DEV-AND-2233',
    deviceName: 'Maria\'s Pixel 8',
    deviceType: 'mobile',
    userId: 'USR-056',
    userName: 'Maria Garcia',
    action: 'Passkey Registration Failed',
    level: 'error',
    ipAddress: '172.16.0.89',
    location: 'Los Angeles, USA',
    details: 'WebAuthn registration failed. NotAllowedError: User cancelled the operation.',
    browser: 'Chrome Mobile 119',
    os: 'Android 14'
  },
  {
    id: 10,
    timestamp: '2025-11-10T09:10:33Z',
    deviceId: 'DEV-WIN-5566',
    deviceName: 'Robert\'s Laptop',
    deviceType: 'desktop',
    userId: 'USR-078',
    userName: 'Robert Taylor',
    action: 'Password Changed',
    level: 'success',
    ipAddress: '192.168.1.178',
    location: 'Denver, USA',
    details: 'User successfully changed account password. Old password archived.',
    browser: 'Edge 119',
    os: 'Windows 11 Home'
  },
  {
    id: 11,
    timestamp: '2025-11-10T08:55:18Z',
    deviceId: 'DEV-TAB-4455',
    deviceName: 'Sales Team Surface',
    deviceType: 'tablet',
    userId: 'USR-091',
    userName: 'Jennifer Lee',
    action: 'Application Access',
    level: 'info',
    ipAddress: '192.168.1.220',
    location: 'Phoenix, USA',
    details: 'User accessed CRM application through DLP portal.',
    browser: 'Edge Mobile',
    os: 'Windows 11'
  },
  {
    id: 12,
    timestamp: '2025-11-10T08:42:09Z',
    deviceId: 'DEV-MAC-7788',
    deviceName: 'Developer MacBook',
    deviceType: 'desktop',
    userId: 'USR-015',
    userName: 'Alex Martinez',
    action: 'API Access Granted',
    level: 'success',
    ipAddress: '192.168.1.45',
    location: 'Portland, USA',
    details: 'OAuth token generated for API access. Expires in 24 hours.',
    browser: 'Chrome 119',
    os: 'macOS Monterey 12.7'
  },
  {
    id: 13,
    timestamp: '2025-11-10T08:30:44Z',
    deviceId: 'DEV-WIN-9900',
    deviceName: 'HR Department PC',
    deviceType: 'desktop',
    userId: 'USR-028',
    userName: 'Patricia White',
    action: 'User Group Modified',
    level: 'info',
    ipAddress: '192.168.1.98',
    location: 'Atlanta, USA',
    details: 'Added 5 new members to "HR Team" user group.',
    browser: 'Chrome 119',
    os: 'Windows 10 Pro'
  },
  {
    id: 14,
    timestamp: '2025-11-10T08:15:27Z',
    deviceId: 'DEV-IPH-3344',
    deviceName: 'Daniel\'s iPhone',
    deviceType: 'mobile',
    userId: 'USR-042',
    userName: 'Daniel Johnson',
    action: 'Account Locked',
    level: 'error',
    ipAddress: '10.0.0.178',
    location: 'Dallas, USA',
    details: 'Account locked after 5 failed login attempts. Contact admin to unlock.',
    browser: 'Safari Mobile',
    os: 'iOS 17.0'
  },
  {
    id: 15,
    timestamp: '2025-11-10T08:05:12Z',
    deviceId: 'DEV-AND-6655',
    deviceName: 'Samsung Tab S9',
    deviceType: 'tablet',
    userId: 'USR-073',
    userName: 'Karen Smith',
    action: 'Shared Password Accessed',
    level: 'info',
    ipAddress: '192.168.1.189',
    location: 'Houston, USA',
    details: 'User accessed password shared by admin@company.com. Valid for 24 hours.',
    browser: 'Samsung Internet',
    os: 'Android 13'
  }
];

const DeviceLogs = () => {
  const [logs, setLogs] = useState<DeviceLog[]>(DUMMY_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | LogLevel>('all');
  const [filterDevice, setFilterDevice] = useState<'all' | DeviceType>('all');
  const [showLevelFilter, setShowLevelFilter] = useState(false);
  const [showDeviceFilter, setShowDeviceFilter] = useState(false);
  const [dateRange, setDateRange] = useState('today');

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'desktop': return <Monitor size={18} className="text-blue-500" />;
      case 'mobile': return <Smartphone size={18} className="text-green-500" />;
      case 'tablet': return <Tablet size={18} className="text-purple-500" />;
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'success': return <CheckCircle size={18} className="text-green-500" />;
      case 'error': return <XCircle size={18} className="text-red-500" />;
      case 'warning': return <AlertCircle size={18} className="text-yellow-500" />;
      case 'info': return <Info size={18} className="text-blue-500" />;
    }
  };

  const getLevelBadgeColor = (level: LogLevel) => {
    switch (level) {
      case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs
    .filter(log => filterLevel === 'all' || log.level === filterLevel)
    .filter(log => filterDevice === 'all' || log.deviceType === filterDevice)
    .filter(log => 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Device', 'User', 'Action', 'Level', 'IP Address', 'Location', 'Details'].join(','),
      ...filteredLogs.map(log => 
        [
          log.timestamp,
          log.deviceName,
          log.userName,
          log.action,
          log.level,
          log.ipAddress,
          log.location,
          `"${log.details}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Device Logs</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredLogs.length} log entries found
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <RefreshCw size={16} />
                Refresh
              </button>
              <button 
                onClick={handleExportLogs}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Level Filter */}
            <div className="relative">
              <button
                onClick={() => setShowLevelFilter(!showLevelFilter)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter size={16} />
                Level: {filterLevel === 'all' ? 'All' : filterLevel}
                <ChevronDown size={16} />
              </button>
              
              {showLevelFilter && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {['all', 'success', 'info', 'warning', 'error'].map((level) => (
                    <button
                      key={level}
                      onClick={() => { setFilterLevel(level as any); setShowLevelFilter(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg capitalize"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Device Filter */}
            <div className="relative">
              <button
                onClick={() => setShowDeviceFilter(!showDeviceFilter)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Monitor size={16} />
                Device: {filterDevice === 'all' ? 'All' : filterDevice}
                <ChevronDown size={16} />
              </button>
              
              {showDeviceFilter && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {['all', 'desktop', 'mobile', 'tablet'].map((device) => (
                    <button
                      key={device}
                      onClick={() => { setFilterDevice(device as any); setShowDeviceFilter(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg capitalize"
                    >
                      {device}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Calendar size={16} />
              Today
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(log.deviceType)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.deviceName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {log.deviceId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.userName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.ipAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {log.action}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelBadgeColor(log.level)}`}>
                          {log.level}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.location}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceLogs;
