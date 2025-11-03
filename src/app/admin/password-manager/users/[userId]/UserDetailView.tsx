'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { pmApiFetch } from '@/lib/pmApiFetch';
import Spinner from '../../components/ui/Spinner';
import MetricCard from '../../components/ui/MetricCard';
import StrengthPieChart from '../../components/StrengthPieChart';
import Card from '../../components/ui/Card';
import StrengthBadge from '../../components/StrengthBadge';

import { 
    FaArrowLeft, FaDownload, FaShareAlt, FaCalendarAlt, 
    FaHistory, FaKey, FaShieldAlt, FaListAlt, FaTrash, FaRedo, FaUserCheck 
} from 'react-icons/fa';
import { FaExclamationTriangle } from 'react-icons/fa';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function UserDetailView({ userId }: { userId: string }) {
    const [data, setData] = useState<any>(null);
    const [passwords, setPasswords] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');

            try {
                const [statsData, passwordsData] = await Promise.all([
                    pmApiFetch(`/admin/users/stats`, {
                        method: 'POST',
                        body: JSON.stringify({ userId }),
                    }),
                    pmApiFetch(`/admin/users/${userId}/passwords`)
                ]);

                setData(statsData);
                setPasswords(passwordsData || []);
            } catch {
                setError('Could not load user details.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId]);

    if (loading) return <Spinner />;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    const { user, stats } = data;
    const totalCount = passwords.length;

    const receivedPasswords = passwords.filter(p => p.user_id !== userId);
    const uniqueReceivedCount = new Set(receivedPasswords.map(p => p.website)).size;

    return (
        <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            
            <motion.div variants={itemVariants}>
                <Link href="/admin/password-manager/users"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4">
                    <FaArrowLeft /> Back to All Users
                </Link>

                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.display_name}</h1>
                        <p className="text-gray-500">{user.company_email}</p>
                    </div>
                </div>
            </motion.div>

            {/* Metric Row */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6" variants={itemVariants}>
                <MetricCard title="Total Passwords" value={totalCount} Icon={FaShieldAlt} />
                <MetricCard title="Passwords Shared" value={stats.totalSent} Icon={FaShareAlt} />
                <MetricCard title="Unique Received" value={uniqueReceivedCount} Icon={FaUserCheck} />
                <MetricCard title="Total Received" value={stats.totalReceived} Icon={FaDownload} />
                <MetricCard title="Deleted" value={stats.totalDeleted || 0} Icon={FaTrash} />
            </motion.div>

            {/* Strength + Age Stats */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={itemVariants}>
                
                {/* Strength & Age */}
                <Card className="h-full">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Strength Distribution</h2>

                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Chart */}
                        <div className={`w-full md:w-1/2 flex items-center justify-center h-80 
                            ${totalCount === 0 ? 'md:justify-center' : ''}`}>
                            
                            {totalCount === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
                                    <FaKey size={42} className="mb-3 text-gray-400" />
                                    <p className="text-lg font-semibold">No Passwords to Analyze</p>
                                    <p className="text-sm text-gray-500">Add credentials to calculate overall health.</p>
                                </div>
                            ) : (
                                <StrengthPieChart data={stats.strengthDistribution} score={stats.healthScore} />
                            )}
                        </div>

                        {/* Age & Weakness */}
                        <div className={`w-full md:w-1/2 space-y-4 pt-4 
                            ${totalCount === 0 ? 'flex flex-col items-center text-center md:items-start md:text-left' : ''}`}>

                            <h3 className="text-base font-semibold text-gray-800 border-b pb-2 w-full">Age & Weakness</h3>

                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 text-red-600 rounded-full p-3">
                                    <FaExclamationTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.passwordAnalysis.weak_passwords}
                                    </p>
                                    <p className="text-sm text-gray-500">Weak Passwords</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 rounded-full p-3">
                                    <FaCalendarAlt className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.passwordAnalysis.old_passwords}
                                    </p>
                                    <p className="text-sm text-gray-500">Older than 90 days</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 rounded-full p-3">
                                    <FaHistory className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.passwordAnalysis.very_old_passwords}
                                    </p>
                                    <p className="text-sm text-gray-500">Older than 1 year</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </Card>

                {/* Vault Composition */}
                <Card className="flex flex-col justify-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Vault Composition</h2>
                    <div className="space-y-4">
                        <MetricCard title="Unique Passwords" value={stats.passwordReuse.unique_passwords} Icon={FaListAlt} />
                        <MetricCard title="Duplicate Passwords" value={totalCount - stats.passwordReuse.unique_passwords} Icon={FaRedo} />
                    </div>
                </Card>
            </motion.div>

            {/* Password Table */}
            <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User's Password Vault</h2>
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strength</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {passwords.length > 0 ? (
                                passwords.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.website}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StrengthBadge strength={p.strength} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        This user has no passwords in the vault.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
