'use client';

import React, { useState, useEffect } from 'react';
import SideDrawer from '@/common/SideDrawer';
import { PrivateRoute } from '@/components/PrivateRoute';
import {apiFetch} from '@/lib/apiFetch'; // Assuming your auth fetch utility is here
import { Commet } from 'react-loading-indicators';


// A reusable component for displaying statistics
interface StatCardProps {
    title: string;
    value: number | string;
    loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, loading }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500">{title}</h3>
        {loading ? (
            <div className="flex justify-center py-6">
                <Commet color="#318bcc" size="small" text="" textColor="" />
            </div>
        ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        )}
    </div>
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
                // Fetch all data points in parallel for better performance
                const [usersResponse, devicesResponse, groupsResponse] = await Promise.all([
                    apiFetch('/user/'),
                    apiFetch('/device'),
                    apiFetch('/user-group'),
                ]);

                // Assuming the API returns an array of items
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
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

    return (
        <PrivateRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome! Here's a quick overview of your system.
                        </p>
                    </div>

                    {/* Statistics Section */}
                    {error ? (
                         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Total Users" value={stats.userCount} loading={loading} />
                            <StatCard title="Total User Groups" value={stats.groupCount} loading={loading} />
                            <StatCard title="Total Devices" value={stats.deviceCount} loading={loading} />

                        </div>
                    )}


                
                </div>

                <SideDrawer
                    isOpen={isDrawerOpen}
                    handleClose={handleDrawerClose}
                    heading="Dashboard Settings"
                    description="System configuration and settings."
                    component={<div>Settings Content</div>}
                    side="right"
                />
            </div>
        </PrivateRoute>
    );
};

export default DashboardPage;