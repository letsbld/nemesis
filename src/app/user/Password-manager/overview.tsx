'use client';

import React from 'react';
import { motion } from 'framer-motion';
<<<<<<< Updated upstream:src/app/user/Password-manager/overview.tsx
import { PlusCircle, Trash2, ShieldCheck, BarChart2, AlertTriangle, Share2, Download } from 'lucide-react';
=======
import { PlusCircle, Trash2, BarChart2, AlertTriangle, Share2, Download } from 'lucide-react';
>>>>>>> Stashed changes:src/app/user/password-manager/overview.tsx

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
    const isDeleted = action === 'deleted';
    const isSent = action === 'sent';
    const isReceived = action === 'received';

    const getIcon = () => {
        if (isDeleted) return <Trash2 className="text-red-600" size={16} />;
        if (isSent) return <Share2 className="text-purple-600" size={16} />;
        if (isReceived) return <Download className="text-yellow-600" size={16} />;
        return <PlusCircle className="text-green-600" size={16} />;
    };
    const getBgColor = () => {
        if (isDeleted) return 'bg-red-100';
        if (isSent) return 'bg-purple-100';
        if (isReceived) return 'bg-yellow-100';
        return 'bg-green-100';
    };
    const getText = () => {
<<<<<<< Updated upstream:src/app/user/Password-manager/overview.tsx
        if (isSent) return <>Password <span className="font-bold">sent</span> to {website}</>;
        if (isReceived) return <>Password <span className="font-bold">received</span> from {website}</>;
=======
>>>>>>> Stashed changes:src/app/user/password-manager/overview.tsx
        return <>Password <span className="font-bold">{action}</span> for {website}</>;
    };

    const formattedDate = new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return (
        <div className="flex items-center gap-4 py-3">
            <div className={`rounded-full p-2 ${getBgColor()}`}>{getIcon()}</div>
            <div className="flex-grow"><p className="text-sm font-medium text-gray-800">{getText()}</p></div>
            <p className="text-xs text-gray-400 flex-shrink-0">{formattedDate}</p>
        </div>
    );
};

const DonutChart = ({ data }: { data: { name: string, count: number, color: string }[] }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    if (total === 0) {
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
        const percent = (item.count / total) * 100;
        const arcLength = (percent / 100) * circumference;
        const rotation = cumulativePercent * 3.6;
        cumulativePercent += percent;
        return { ...item, percent, arcLength, rotation };
    });

    return (
        <div className="flex flex-col items-center justify-center gap-6 py-4">
             <div className="relative w-56 h-56 flex items-center justify-center">
                <svg viewBox="0 0 140 140" className="transform -rotate-90 w-full h-full">
                    <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth={strokeWidth} />
                    {segments.map((segment) => (
                        <motion.circle
                            key={segment.name}
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${segment.arcLength} ${circumference}`}
                            transform={`rotate(${segment.rotation} 70 70)`}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-gray-800">{total}</span>
                    <span className="text-sm text-gray-500">Total</span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 w-full pt-2">
                {segments.map((item) => (
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
            <div className="animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="h-24 bg-gray-200 rounded-lg"></div><div className="h-24 bg-gray-200 rounded-lg"></div>
                    <div className="h-24 bg-gray-200 rounded-lg"></div><div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div><div className="lg:col-span-3 h-64 bg-gray-200 rounded-lg"></div>
                </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total Added" value={stats.totalAdded} icon={PlusCircle} iconBgColor="bg-blue-500" />
                <StatCard title="Total Deleted" value={stats.totalDeleted} icon={Trash2} iconBgColor="bg-red-500" />
                <StatCard title="Sent" value={stats.totalSent} icon={Share2} iconBgColor="bg-purple-500" />
                <StatCard title="Received" value={stats.totalReceived} icon={Download} iconBgColor="bg-yellow-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2"><BarChart2 size={20} />Strength Distribution</h2>
                    <DonutChart data={stats.strengthDistribution} />
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.recentActivity.length > 0 ? (
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