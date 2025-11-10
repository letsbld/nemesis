'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiFetch'; 
import MetricCard from '../components/ui/MetricCard';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import RecentActivity from '../components/RecentActivity';
import { FaShieldAlt, FaClock, FaShareAlt, FaExclamationTriangle, FaKey, FaUsers } from 'react-icons/fa';
import dynamic from 'next/dynamic';  

const DynamicStrengthPieChart = dynamic(
    () => import('../components/StrengthPieChart'), 
    { ssr: false }
);

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5
        }
    }
};

export default function DashboardView() {
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState('');

    const fetchStats = () => {
        setError('');
        setStats(null);
        apiFetch('/password-generator/admin/stats') 
            .then(setStats)
            .catch(() => setError('Could not load system stats.'));
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-600 p-4 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
        );
    }

    if (!stats) return <Spinner />;

    return (
        <div className="bg-gray-100 dark:bg-[#101828] -m-6 p-6 min-h-full flex flex-col">
            <motion.div
                className="space-y-6 flex-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="flex justify-between items-center"
                    variants={itemVariants}
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                    <Link href="/admin/password-manager/users">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                            <FaUsers /> Manage Users
                        </button>
                    </Link>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={itemVariants}
                >
                    <MetricCard title="Total Passwords" value={stats.totalGenerated} Icon={FaShieldAlt} />
                    <MetricCard title="Active Passwords" value={stats.totalActive} Icon={FaClock} />
                    <MetricCard title="Shared Passwords" value={stats.totalShared || 0} Icon={FaShareAlt} />
                    <MetricCard
                        title="Weak Passwords"
                        value={stats.strengthDistribution.find((s: any) => s.name === 'Weak')?.count ?? 0}
                        Icon={FaExclamationTriangle}
                    />
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <motion.div className="lg:col-span-1" variants={itemVariants}>
                        <Card className="h-full">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-200 mb-2">Password Strength Distribution</h2>
                            <div className="h-[460px]">
                                {stats.totalActive > 0 ? (
                                    <DynamicStrengthPieChart data={stats.strengthDistribution} score={stats.healthScore} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 h-full">
                                        <FaKey size={48} className="mb-4 text-gray-400 dark:text-gray-500" />
                                        <p className="text-lg font-semibold">No Passwords to Analyze</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Add credentials to calculate system health.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                    <motion.div className="lg:col-span-1" variants={itemVariants}>
                        <Card className="h-full">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-200 mb-4">Recent Activity</h2>
                            {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                <RecentActivity activities={stats.recentActivity} />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">No recent activity to display.</p>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}