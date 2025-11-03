// FILE: src/app/user/password-generator/overview.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, BarChart2, AlertTriangle, Share2, Download } from 'lucide-react';
import { Commet } from 'react-loading-indicators';

const StatCard = ({ title, value, icon: Icon, iconBgColor }: { title: string; value: any; icon: React.ElementType; iconBgColor: string; }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
        <div className={`rounded-full p-3 ${iconBgColor}`}><Icon className="text-white" size={20} /></div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ActivityItem = ({ action, website, created_at }: { action: string; website: string; created_at: string; }) => {
    const isCreated = action === 'created';
    const formattedDate = new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return (
        <div className="flex items-center gap-4 py-3">
            <div className={`rounded-full p-2 ${isCreated ? 'bg-green-100' : 'bg-red-100'}`}>
                {isCreated ? <PlusCircle className="text-green-600" size={16} /> : <Trash2 className="text-red-600" size={16} />}
            </div>
            <div className="flex-grow">
                <p className="text-sm font-medium text-gray-800">
                    Password {action} for <span className="font-bold">{website}</span>
                </p>
            </div>
            <p className="text-xs text-gray-400 flex-shrink-0">{formattedDate}</p>
        </div>
    );
};

const DonutChart = ({ data }: { data: { name: string, count: number, color: string }[] }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    if (!data || data.length === 0 || total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f3f4f6" strokeWidth="10" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart2 className="text-gray-300" size={40} />
                    </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">No strength data available</p>
            </div>
        );
    }

    const radius = 60;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;
    const segments = data.map(item => {
        const percent = total > 0 ? (item.count / total) * 100 : 0;
        const dashArray = 2 * Math.PI * 45; const dashOffset = dashArray * (1 - (percent / 100));
        const rotation = cumulativePercent * 3.6; cumulativePercent += percent;
        return { ...item, percent, dashArray, dashOffset, rotation };
    });
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
             <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {segments.map((segment) => (
                        <circle key={segment.name} cx="50" cy="50" r="45" fill="transparent" stroke={segment.color} strokeWidth="10" strokeDasharray={segment.dashArray} strokeDashoffset={segment.dashOffset} transform={`rotate(${segment.rotation} 50 50)`}/>
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{total}</span>
                    <span className="text-xs text-gray-500">Total</span>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {segments.map((item) => (
                    item.count > 0 && 
                    <div key={item.name} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-semibold text-gray-800">({Math.round(item.percent)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function OverviewPage({ stats, isLoading, error, retryFetch }: { stats: any, isLoading: boolean, error: string | null, retryFetch: () => void }) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Commet color="#2563eb" size="medium" text="" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <AlertTriangle className="mx-auto text-red-400 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-red-600">Could not load overview</h3>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
                <button onClick={retryFetch} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
            </div>
        );
    }

    if (!stats) return <div className="text-center text-gray-500 py-10">No data to display.</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Total Added" value={stats.totalAdded} icon={PlusCircle} iconBgColor="bg-blue-500" />
                <StatCard title="Total Deleted" value={stats.totalDeleted} icon={Trash2} iconBgColor="bg-red-500" />
                <StatCard title="Active" value={stats.totalActive} icon={ShieldCheck} iconBgColor="bg-green-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BarChart2 size={20} />Strength Distribution</h2>
                    <DonutChart data={stats.strengthDistribution} />
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((item: any) => <ActivityItem key={item.id} {...item} />)
                        ) : (
                            <p className="text-center text-gray-500 py-8">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}