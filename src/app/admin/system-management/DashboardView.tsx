'use client';

import React, { useEffect, useState } from 'react';
import { TentyService, Agent } from './lib/api';

// Components
import { Card, Spinner, MetricCard } from './components/ui/SystemUI';
import AgentsTable from './components/AgentsTable';
import { InstallModal } from './components/InstallModal';

// Icons
import { FaServer, FaDesktop, FaNetworkWired, FaPlus, FaSync, FaExclamationTriangle } from 'react-icons/fa';

export default function DashboardView() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await TentyService.getAllAgents();
            setAgents(data || []);
        } catch (err: any) {
            console.error("Fleet Load Error:", err);
            if (err.response?.status === 401) {
                setError("Authentication Failed. Please check if you are logged in as Admin.");
            } else if (err.response?.status === 503) {
                setError("Tenty Engine is offline. Please check the backend container.");
            } else {
                setError("Unable to connect to System Management service.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Metrics
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const disconnected = totalAgents - activeAgents;

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Spinner /></div>;

    return (
        <div className="p-8 space-y-8 animate-fade-in min-h-screen bg-gray-50 dark:bg-gray-900">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">System Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time fleet monitoring.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchData} 
                        className="p-3 bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-indigo-500 shadow-sm"
                        title="Refresh Data"
                    >
                        <FaSync />
                    </button>
                    <button 
                        onClick={() => setShowModal(true)} 
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                    >
                        <FaPlus /> Deploy Agent
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                    <FaExclamationTriangle className="text-xl flex-shrink-0" />
                    <div>
                        <p className="font-bold">Access Denied / Network Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Total Agents" value={totalAgents} Icon={FaServer} />
                <MetricCard title="Active Systems" value={activeAgents} Icon={FaNetworkWired} />
                <MetricCard title="Offline / Disconnected" value={disconnected} Icon={FaDesktop} />
            </div>

            {/* Main Table */}
            <AgentsTable 
                agents={agents} 
                onDelete={fetchData} // FIX: Don't double delete, just refresh
            />

            {/* Installer Modal */}
            {showModal && <InstallModal onClose={() => setShowModal(false)} />}
        </div>
    );
}