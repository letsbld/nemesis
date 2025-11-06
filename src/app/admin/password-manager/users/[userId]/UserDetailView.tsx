'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/apiFetch'; 
import Spinner from '../../components/ui/Spinner';
import MetricCard from '../../components/ui/MetricCard';
import Card from '../../components/ui/Card';
import StrengthBadge from '../../components/StrengthBadge';
import { useAuth } from '@/context/AuthContext'; 

import dynamic from 'next/dynamic'; 
const DynamicStrengthPieChart = dynamic(
    () => import('../../components/StrengthPieChart'), 
    { ssr: false }
);

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
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [passwords, setPasswords] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setError("Authentication required for Admin actions.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            const customHeaders = {
                'x-user-id': user.id,
                'x-user-name': user.display_name || user.username || 'Admin',
            };

            try {
                const [statsData, passwordsData] = await Promise.all([
                    apiFetch(`/password-generator/admin/users/stats`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            ...customHeaders 
                        },
                        body: JSON.stringify({ userId }), 
                    }),
                    apiFetch(`/password-generator/admin/users/${userId}/passwords`, {
                        headers: customHeaders,
                    })
                ]);

                setData(statsData);
                setPasswords(passwordsData || []);
            } catch (err: any) {
                
                setError(err.error || 'Could not load user details.'); 
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId, user]); 

    if (loading) return <Spinner />;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    const { stats } = data;
    const totalCount = passwords.length;

    const receivedPasswords = passwords.filter(p => p.user_id !== userId);
    const uniqueReceivedCount = new Set(receivedPasswords.map(p => p.website)).size;

    return (
        <div className="bg-gray-100 -m-6 p-6 min-h-full flex flex-col">
            <motion.div className="space-y-8 flex-1" variants={containerVariants} initial="hidden" animate="visible">
                
                <motion.div variants={itemVariants}>
                    <Link href="/admin/password-manager/users"
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4">
                        <FaArrowLeft /> Back to All Users
                    </Link>

                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{data.user.display_name}</h1>
                        <p className="text-gray-500">{data.user.company_email}</p>
                    </div>
                </div>
            </motion.div>

                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6" variants={itemVariants}>
                    <MetricCard title="Total Passwords" value={totalCount} Icon={FaShieldAlt} />
                    <MetricCard title="Passwords Shared" value={stats.totalSent} Icon={FaShareAlt} />
                    <MetricCard title="Unique Received" value={uniqueReceivedCount} Icon={FaUserCheck} />
                    <MetricCard title="Total Received" value={stats.totalReceived} Icon={FaDownload} />
                    <MetricCard title="Deleted" value={stats.totalDeleted || 0} Icon={FaTrash} />
                </motion.div>

                <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
                    
                    <Card className="h-full lg:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Strength Distribution</h2>

                        <div className="flex flex-col md:flex-row gap-6">

                            <div className={`w-full md:w-1/2 flex items-center justify-center h-[400px] 
                                ${totalCount === 0 ? 'md:justify-center' : ''}`}>
                                
                                {totalCount === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
                                        <FaKey size={42} className="mb-3 text-gray-400" />
                                        <p className="text-lg font-semibold">No Passwords to Analyze</p>
                                        <p className="text-sm text-gray-500">Add credentials to calculate overall health.</p>
                                    </div>
                                ) : (
                                    <DynamicStrengthPieChart data={stats.strengthDistribution} score={stats.healthScore} />
                                )}
                            </div>

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

                    <Card className="flex flex-col justify-center lg:col-span-1">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Vault Composition</h2>
                        <div className="space-y-4">
                            <MetricCard title="Unique Passwords" value={stats.passwordReuse.unique_passwords} Icon={FaListAlt} />
                            <MetricCard title="Duplicate Passwords" value={totalCount - stats.passwordReuse.unique_passwords} Icon={FaRedo} />
                        </div>
                    </Card>
                </motion.div>

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
        </div>
    );
}