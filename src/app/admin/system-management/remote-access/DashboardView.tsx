'use client';

import React, { useEffect, useState } from 'react';
import { MeshCentralService } from '../lib/api';
import { Spinner, Card } from '../components/ui/SystemUI';
import { TerminalModal } from '../components/TerminalModal';
import { DesktopModal } from '../components/DesktopModal';
import { FaTerminal, FaDesktop, FaExclamationTriangle, FaCircle, FaSync } from 'react-icons/fa';

export default function RemoteAccessDashboard() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSession, setActiveSession] = useState<{ type: 'terminal' | 'desktop', device: any } | null>(null);

    const fetchDevices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await MeshCentralService.getDevices();
            // Ensure we are strictly dealing with an array
            setDevices(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("Failed to establish a connection to the Remote Control engine.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDevices(); }, []);

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Spinner /></div>;

    return (
        <div className="p-8 space-y-8 animate-fade-in min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Remote Control Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Direct fleet interaction via terminal or desktop interface.</p>
                </div>
                <button onClick={fetchDevices} className="flex items-center justify-center p-3 bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-indigo-500 shadow-sm transition-all" title="Refresh Devices">
                    <FaSync />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                    <FaExclamationTriangle className="text-xl flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.length === 0 && !error ? (
                    <div className="col-span-full text-center py-20 text-gray-400 bg-white dark:bg-[#1a2332] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        No agents available for remote control. Deploy an agent to get started.
                    </div>
                ) : (
                    devices.map((device, idx) => {
                        // SAFELY extract variables with fallbacks to prevent crashes
                        const deviceId = device?.nodeid || device?._id || device?.id || `unknown-id-${idx}`;
                        const deviceName = device?.name || 'Unknown Device';
                        const isOnline = !!device?.conn; // Forces truthy/falsy check safely

                        return (
                            <Card key={deviceId} className="group hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="pr-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate" title={deviceName}>{deviceName}</h3>
                                        <p className="text-xs text-gray-500 font-mono mt-1 break-all">
                                            {/* Safe substring call */ }
                                            {String(deviceId).substring(0, 18)}...
                                        </p>
                                    </div>
                                    <div className={`flex flex-shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                                        <FaCircle size={8} className={isOnline ? 'text-emerald-500' : 'text-gray-400'} /> 
                                        {isOnline ? 'Online' : 'Offline'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <button 
                                        onClick={() => setActiveSession({ type: 'terminal', device: { ...device, nodeid: deviceId, name: deviceName } })} 
                                        disabled={!isOnline} 
                                        className="flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-green-400 rounded-lg font-mono text-sm hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-700"
                                    >
                                        <FaTerminal size={14} /> Terminal
                                    </button>
                                    <button 
                                        onClick={() => setActiveSession({ type: 'desktop', device: { ...device, nodeid: deviceId, name: deviceName } })} 
                                        disabled={!isOnline} 
                                        className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/10"
                                    >
                                        <FaDesktop size={14} /> Desktop
                                    </button>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {activeSession?.type === 'terminal' && <TerminalModal device={activeSession.device} onClose={() => setActiveSession(null)} />}
            {activeSession?.type === 'desktop' && <DesktopModal device={activeSession.device} onClose={() => setActiveSession(null)} />}
        </div>
    );
}