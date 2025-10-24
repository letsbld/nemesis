// FILE: src/app/user/password-generator/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, PlusCircle } from 'lucide-react';
import OverviewPage from './overview';
import ManagePasswordsPage from './manage';
import CreatePasswordPage from './create';
import {apiFetch} from '@/lib/apiFetch'

type Tab = 'overview' | 'manage' | 'create';

export default function PasswordVaultPage() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [stats, setStats] = useState(null);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true);
        setStatsError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setStatsError('Authentication token not found.');
            setIsLoadingStats(false);
            return;
        }
        try {
            const response = await apiFetch('/password-stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch stats.');
            }
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setStatsError((err as Error).message);
            console.error(err);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'manage', label: 'Manage', icon: ShieldCheck },
        { id: 'create', label: 'Create', icon: PlusCircle },
    ];

    return (
        <div className="px-4 sm:px-6 lg:px-8 pb-8 bg-white min-h-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center my-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Password Vault</h1>
                        <p className="text-sm text-gray-500 mt-1">Your central hub for managing secure credentials.</p>
                    </div>
                </div>

                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`${
                                activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-4 text-sm font-medium focus:outline-none transition-all`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && <OverviewPage stats={stats} isLoading={isLoadingStats} error={statsError} retryFetch={fetchStats} />}
                            {activeTab === 'manage' && <ManagePasswordsPage onCredentialChange={fetchStats} />}
                            {activeTab === 'create' && <CreatePasswordPage onCredentialChange={fetchStats} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}