'use client';

import React, { useState, useEffect } from 'react';
import SideDrawer from '@/common/SideDrawer';
import { PrivateRoute } from '@/components/PrivateRoute';
import { apiFetch } from '@/lib/apiFetch';
import { Commet } from 'react-loading-indicators';
import { motion } from 'framer-motion';
import { FaUsers, FaMicrochip, FaLayerGroup } from 'react-icons/fa';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-[#101828] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <Commet color="#2563eb" size="small" text="" textColor="" />
          </div>
        ) : (
          <p className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white">{value}</p>
        )}
      </div>
      <div className="text-blue-600 dark:text-blue-400 text-4xl opacity-80">{icon}</div>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    userCount: 0,
    deviceCount: 0,
    groupCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersResponse, devicesResponse, groupsResponse] = await Promise.all([
          apiFetch('/user/'),
          apiFetch('/device'),
          apiFetch('/user-group'),
        ]);

        setStats({
          userCount: usersResponse.length,
          deviceCount: devicesResponse.devices.length,
          groupCount: groupsResponse.length,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDrawerClose = () => setIsDrawerOpen(false);

  return (
    <PrivateRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-[#101828]">
        <div className="max-w-7xl mx-auto py-10 px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Welcome back, Admin! Here's an overview of your system.
            </p>
          </motion.div>

          {/* Stats Section */}
          {error ? (
            <div
              className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-400 p-4 rounded-md shadow"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard
                title="Total Users"
                value={stats.userCount}
                loading={loading}
                icon={<FaUsers />}
              />
              <StatCard
                title="User Groups"
                value={stats.groupCount}
                loading={loading}
                icon={<FaLayerGroup />}
              />
              <StatCard
                title="Devices"
                value={stats.deviceCount}
                loading={loading}
                icon={<FaMicrochip />}
              />
            </div>
          )}

          {/* Drawer */}
          <SideDrawer
            isOpen={isDrawerOpen}
            handleClose={handleDrawerClose}
            heading="Dashboard Settings"
            description="System configuration and settings."
            component={<div>Settings Content</div>}
            side="right"
          />
        </div>
      </div>
    </PrivateRoute>
  );
};

export default DashboardPage;
