'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';

interface DeviceStats {
  total: number;
  active: number;
  inactive: number;
  desktop: number;
  mobile: number;
  tablet: number;
}

interface SecurityMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  status: 'good' | 'warning' | 'critical';
}

interface DeviceActivity {
  date: string;
  logins: number;
  registrations: number;
  failures: number;
}

const DEVICE_STATS: DeviceStats = {
  total: 487,
  active: 423,
  inactive: 64,
  desktop: 234,
  mobile: 189,
  tablet: 64
};

const SECURITY_METRICS: SecurityMetric[] = [
  {
    name: 'Authentication Success Rate',
    value: 97.8,
    change: 2.3,
    trend: 'up',
    status: 'good'
  },
  {
    name: 'MFA Adoption Rate',
    value: 89.2,
    change: 5.7,
    trend: 'up',
    status: 'good'
  },
  {
    name: 'Failed Login Attempts',
    value: 23,
    change: -15.4,
    trend: 'down',
    status: 'good'
  },
  {
    name: 'Suspicious Activities',
    value: 12,
    change: 8.2,
    trend: 'up',
    status: 'warning'
  },
  {
    name: 'Account Lockouts',
    value: 5,
    change: -20.0,
    trend: 'down',
    status: 'good'
  },
  {
    name: 'Passkey Adoption',
    value: 67.4,
    change: 12.8,
    trend: 'up',
    status: 'good'
  }
];

const WEEKLY_ACTIVITY: DeviceActivity[] = [
  { date: 'Mon', logins: 342, registrations: 12, failures: 8 },
  { date: 'Tue', logins: 378, registrations: 15, failures: 5 },
  { date: 'Wed', logins: 412, registrations: 9, failures: 11 },
  { date: 'Thu', logins: 389, registrations: 18, failures: 7 },
  { date: 'Fri', logins: 456, registrations: 21, failures: 4 },
  { date: 'Sat', logins: 234, registrations: 6, failures: 3 },
  { date: 'Sun', logins: 189, registrations: 4, failures: 2 }
];

const TOP_DEVICES = [
  { name: 'Windows Desktop', count: 234, percentage: 48.1, icon: Monitor, color: 'bg-blue-500' },
  { name: 'iPhone', count: 128, percentage: 26.3, icon: Smartphone, color: 'bg-green-500' },
  { name: 'MacBook', count: 67, percentage: 13.8, icon: Monitor, color: 'bg-purple-500' },
  { name: 'Android Phone', count: 61, percentage: 12.5, icon: Smartphone, color: 'bg-orange-500' },
  { name: 'iPad', count: 42, percentage: 8.6, icon: Tablet, color: 'bg-pink-500' },
];

const BROWSER_STATS = [
  { name: 'Chrome', count: 245, percentage: 50.3 },
  { name: 'Safari', count: 132, percentage: 27.1 },
  { name: 'Edge', count: 78, percentage: 16.0 },
  { name: 'Firefox', count: 32, percentage: 6.6 }
];

const DeviceReport = () => {
  const [reportPeriod, setReportPeriod] = useState('last-7-days');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
    }
  };

  const getStatusBg = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-green-100 dark:bg-green-900/30';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'critical': return 'bg-red-100 dark:bg-red-900/30';
    }
  };

  const maxLogins = Math.max(...WEEKLY_ACTIVITY.map(d => d.logins));

  const handleExportReport = () => {
    console.log('Exporting report...');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Device Analytics Report</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Comprehensive security and usage metrics
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Devices</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{DEVICE_STATS.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Monitor className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Devices</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{DEVICE_STATS.active}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {((DEVICE_STATS.active / DEVICE_STATS.total) * 100).toFixed(1)}% of total
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Inactive Devices</p>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{DEVICE_STATS.inactive}</p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Activity className="text-gray-600 dark:text-gray-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              No activity in 30+ days
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Security Score</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">92.5</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <TrendingUp size={12} />
              +3.2% from last month
            </p>
          </motion.div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-gray-700 dark:text-gray-300" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security Metrics</h2>
            </div>
            <div className="space-y-4">
              {SECURITY_METRICS.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => setSelectedMetric(metric.name)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value}{metric.name.includes('Rate') || metric.name.includes('Adoption') ? '%' : ''}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${
                        metric.trend === 'up' 
                          ? metric.status === 'warning' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {metric.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${getStatusBg(metric.status)}`}>
                    {metric.status === 'good' ? (
                      <CheckCircle className={getStatusColor(metric.status)} size={20} />
                    ) : (
                      <AlertTriangle className={getStatusColor(metric.status)} size={20} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-gray-700 dark:text-gray-300" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Activity</h2>
            </div>
            <div className="space-y-3">
              {WEEKLY_ACTIVITY.map((day, index) => (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{day.date}</span>
                    <span className="text-gray-500 dark:text-gray-400">{day.logins} logins</span>
                  </div>
                  <div className="flex gap-1 h-8 items-end">
                    <div
                      className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t transition-all hover:bg-blue-600 dark:hover:bg-blue-500"
                      style={{ height: `${(day.logins / maxLogins) * 100}%` }}
                      title={`${day.logins} logins`}
                    />
                    <div
                      className="flex-1 bg-green-500 dark:bg-green-600 rounded-t transition-all hover:bg-green-600 dark:hover:bg-green-500"
                      style={{ height: `${(day.registrations / 25) * 100}%` }}
                      title={`${day.registrations} registrations`}
                    />
                    <div
                      className="flex-1 bg-red-500 dark:bg-red-600 rounded-t transition-all hover:bg-red-600 dark:hover:bg-red-500"
                      style={{ height: `${(day.failures / 15) * 100}%` }}
                      title={`${day.failures} failures`}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Logins</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Registrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Failures</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Distribution & Browser Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Devices */}
          <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="text-gray-700 dark:text-gray-300" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Device Distribution</h2>
            </div>
            <div className="space-y-3">
              {TOP_DEVICES.map((device, index) => (
                <motion.div
                  key={device.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <device.icon className="text-gray-600 dark:text-gray-400" size={16} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {device.count} ({device.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${device.color} h-2 rounded-full transition-all`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Browser Stats */}
          <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-gray-700 dark:text-gray-300" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Browser Usage</h2>
            </div>
            <div className="space-y-3">
              {BROWSER_STATS.map((browser, index) => (
                <motion.div
                  key={browser.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{browser.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {browser.count} ({browser.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${browser.percentage}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Recommendation:</strong> Chrome leads with 50.3% usage. Consider optimizing for Chrome and Safari for best coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceReport;
