'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TentyService, Agent } from '../lib/api';
import { FaDesktop, FaLinux, FaApple, FaWindows, FaTrash, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { Spinner } from './ui/SystemUI';

const getOsIcon = (osName: string = '') => {
    const lower = osName.toLowerCase();
    if (lower.includes('windows')) return <FaWindows className="text-blue-400" />;
    if (lower.includes('linux')) return <FaLinux className="text-yellow-500" />;
    if (lower.includes('mac') || lower.includes('darwin')) return <FaApple className="text-gray-400" />;
    return <FaDesktop className="text-gray-500" />;
};

// Update: onDelete is just a trigger to refresh, no args needed
export default function AgentsTable({ agents, onDelete }: { agents: Agent[], onDelete?: () => void }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    const confirmDelete = (agent: Agent) => {
        setSelectedAgent(agent);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedAgent) return;
        setIsDeleting(selectedAgent.id);
        try {
            await TentyService.deleteAgent(selectedAgent.id);
            // Just call the callback to refresh data, don't pass ID
            if (onDelete) onDelete(); 
            else router.refresh(); 
        } catch (error) {
            alert("Failed to delete agent. It might be unreachable.");
        } finally {
            setIsDeleting(null);
            setModalOpen(false);
            setSelectedAgent(null);
        }
    };

    return (
        <div className="relative">
            {/* DELETE MODAL */}
            {modalOpen && selectedAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <FaExclamationTriangle size={24} />
                            <h3 className="text-xl font-bold">Remove Agent?</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            You are removing <strong>{selectedAgent.name}</strong> (ID: {selectedAgent.id}).
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400 mb-6">
                            <strong>Note:</strong> If the agent is still installed on the target PC, it will automatically reappear here as &quot;Pending&quot;.
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} disabled={!!isDeleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2">
                                {isDeleting === selectedAgent.id ? <Spinner /> : <FaTrash />} Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Agent Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">OS</th>
                            <th className="px-6 py-4">IP</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
                        {agents.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">No agents connected.</td></tr>
                        ) : (
                            agents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{agent.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${agent.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                            {agent.status === 'active' ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            {getOsIcon(agent.os.name)} <span>{agent.os.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">{agent.ip}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* UPDATED VIEW BUTTON */}
                                            <Link 
                                                href={`/admin/system-management/agent/${agent.id}`} 
                                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                                            >
                                                <FaEye size={14} />
                                                <span>View</span>
                                            </Link>
                                            
                                            <button 
                                                onClick={() => confirmDelete(agent)} 
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 rounded-lg transition-colors"
                                                title="Delete Agent"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}