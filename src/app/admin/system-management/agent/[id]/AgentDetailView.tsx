'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TentyService } from '../../lib/api';

// Components
import { Card, Spinner } from '../../components/ui/SystemUI';
import SoftwareTable from '../../components/SoftwareTable';

// Icons
import { FaArrowLeft, FaMicrochip, FaMemory, FaNetworkWired, FaExclamationTriangle, FaTrash, FaDesktop, FaServer } from 'react-icons/fa';

export default function AgentDetailView({ agentId }: { agentId: string }) {
    const router = useRouter();
    const [details, setDetails] = useState<any | null>(null);
    const [software, setSoftware] = useState<any>({ packages: [], updates: [] });
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [d, s] = await Promise.all([
                    TentyService.getAgentDetails(agentId),
                    TentyService.getSoftware(agentId)
                ]);
                setDetails(d);
                setSoftware(s);
            } catch (error) {
                console.error("Failed to load details", error);
            } finally {
                setLoading(false);
            }
        };
        if (agentId) load();
    }, [agentId]);

    // --- HANDLER: DELETE ---
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await TentyService.deleteAgent(agentId);
            // Wait 500ms then force redirect to fleet
            setTimeout(() => {
                router.replace('/admin/system-management');
            }, 500);
        } catch (error) {
            alert("Delete failed. Agent might be active.");
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Spinner /></div>;
    
    if (!details) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900">
                <FaExclamationTriangle className="text-5xl text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Not Found</h2>
                <Link href="/admin/system-management" className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">Return to Fleet</Link>
            </div>
        );
    }

    const cpu = details.cpu || {};
    const ram = details.ram || {};
    const network = details.network || [];
    const totalRamMB = Math.round((ram.total || 0) / 1024);
    const freeRamMB = Math.round((ram.free || 0) / 1024);
    const usedRamPercent = ram.usage || 0;

    return (
        <div className="p-8 space-y-6 animate-fade-in pb-20 relative">
            
            {/* --- DELETE MODAL --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <FaExclamationTriangle size={24} />
                            <h3 className="text-xl font-bold">Remove Agent?</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            You are about to remove <strong>{details.summary?.name}</strong>.
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400 mb-6">
                            <strong>Note:</strong> If the agent is still active on the PC, it may reappear automatically. Uninstall it from the PC to remove it permanently.
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg flex items-center gap-2">
                                {isDeleting ? <Spinner /> : <FaTrash />}
                                {isDeleting ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/system-management" className="p-3 bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                        <FaArrowLeft className="text-gray-500" />
                    </Link>
                    <div>
                        {/* 1. ASSIGNED NAME (Big) */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {details.summary?.name || 'Unnamed Agent'}
                        </h1>
                        {/* 2. PC NAME & OS (Small) */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                                <FaDesktop size={12} /> {details.summary?.hostname}
                            </span>
                            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                                <FaServer size={12} /> {details.summary?.os_name}
                            </span>
                            <span className="font-mono text-gray-400">ID: {details.summary?.agent_id}</span>
                        </div>
                    </div>
                </div>

                <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2332] border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm">
                    <FaTrash size={14} /> Delete Agent
                </button>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none"><FaMicrochip size={100} /></div>
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2"><FaMicrochip className="text-indigo-500" /> Processor</h3>
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{cpu.cores || 1} <span className="text-lg font-normal text-gray-500">Cores</span></div>
                        <div className="text-sm text-gray-500 mt-1 truncate">{cpu.name || 'Unknown CPU'}</div>
                    </div>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none"><FaMemory size={100} /></div>
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2"><FaMemory className="text-blue-500" /> Memory Usage</h3>
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{usedRamPercent}%</div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${usedRamPercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${usedRamPercent}%` }}></div></div>
                        <div className="mt-2 text-xs text-gray-400 flex justify-between"><span>Free: {freeRamMB} MB</span><span>Total: {totalRamMB} MB</span></div>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2"><FaNetworkWired className="text-emerald-500" /> Network Interfaces</h3>
                    <div className="space-y-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
                        {network.length > 0 ? (network.map((net: any, idx: number) => (<div key={idx} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50 text-xs"><div><div className="font-semibold text-gray-700 dark:text-gray-200">{net.name}</div><div className="text-gray-500">{net.ip || 'No IP'}</div></div><div className="font-mono text-gray-400">{net.mac || '-'}</div></div>))) : (<div className="text-gray-400 text-sm">No interfaces detected</div>)}
                    </div>
                </Card>
            </div>
            <div><SoftwareTable packages={software?.packages || []} /></div>
        </div>
    );
}