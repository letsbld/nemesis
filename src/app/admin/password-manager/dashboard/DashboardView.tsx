'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pmApiFetch } from '@/lib/pmApiFetch';
import MetricCard from '../components/ui/MetricCard';
import StrengthPieChart from '../components/StrengthPieChart';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import RecentActivity from '../components/RecentActivity';
import { FaShieldAlt, FaClock, FaShareAlt, FaExclamationTriangle } from 'react-icons/fa';

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
        pmApiFetch('/admin/stats')
            .then(setStats)
            .catch(() => setError('Could not load system stats.'));
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
            </div>
        );
    }

    if (!stats) return <Spinner />;

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
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
            
            {/* The final, balanced 2-column grid with stretching items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <motion.div className="lg:col-span-1" variants={itemVariants}>
                    <Card className="h-full">
                        <h2 className="text-lg font-semibold text-slate-800 mb-2">Password Strength Distribution</h2>
                        {/* A fixed height container for the chart */}
                        <div className="h-[400px]">
                            <StrengthPieChart data={stats.strengthDistribution} score={stats.healthScore} />
                        </div>
                    </Card>
                </motion.div>
                <motion.div className="lg:col-span-1" variants={itemVariants}>
                    <Card className="h-full">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            <RecentActivity activities={stats.recentActivity} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-slate-500">No recent activity to display.</p>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}