'use client';

import React, { useState } from 'react';
import { TentyService, MeshCentralService } from '../lib/api';
import { FaWindows, FaLinux, FaApple, FaCopy, FaCheck, FaTerminal, FaDownload } from 'react-icons/fa';

export const InstallModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStep] = useState(1);
    const [os, setOs] = useState<'windows' | 'linux' | 'mac' | null>(null);
    const [name, setName] = useState('');
    
    const [command, setCommand] = useState('');
    const [mcCommand, setMcCommand] = useState('');
    
    const [copiedTenty, setCopiedTenty] = useState(false);
    const [copiedMc, setCopiedMc] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const generate = async () => {
        if (!os || !name) return;
        setLoading(true);
        try {
            const res = await TentyService.generateInstallScript(os, name);
            setCommand(res.command);

            if (os === 'linux') {
                const mcRes = await MeshCentralService.getLinuxInstall();
                setMcCommand(mcRes.command);
            } else if (os === 'mac') {
                const mcRes = await MeshCentralService.getMacInstall();
                setMcCommand(mcRes.command);
            }
            
            setStep(3);
        } catch (e) {
            alert("Failed to generate script. Is the backend online?");
        } finally {
            setLoading(false);
        }
    };

    const copyTenty = () => {
        navigator.clipboard.writeText(command);
        setCopiedTenty(true);
        setTimeout(() => setCopiedTenty(false), 2000);
    };

    const copyMc = () => {
        navigator.clipboard.writeText(mcCommand);
        setCopiedMc(true);
        setTimeout(() => setCopiedMc(false), 2000);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await MeshCentralService.downloadWindowsAgent();
        } catch (error) {
            alert("Failed to download Windows agent. Please check your connection.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1a2332] rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Deploy New Agent</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'windows', icon: FaWindows, label: 'Windows' },
                                { id: 'linux', icon: FaLinux, label: 'Linux' },
                                { id: 'mac', icon: FaApple, label: 'macOS' },
                            ].map((item) => (
                                <button key={item.id} onClick={() => { setOs(item.id as any); setStep(2); }}
                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all">
                                    <item.icon className="w-8 h-8 text-gray-400 hover:text-indigo-500" />
                                    <span className="font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Agent Name</label>
                                <input autoFocus type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Production-DB-01" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <button onClick={generate} disabled={!name || loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex justify-center">
                                {loading ? "Generating..." : "Generate Script"}
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-300">Back</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                            
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tenty Engine</label>
                                <div className="p-4 rounded-lg bg-gray-950 border border-gray-800 font-mono text-sm text-green-400 break-all relative">
                                    <FaTerminal className="absolute top-3 left-3 text-gray-600" />
                                    <div className="pl-6 select-all">{command}</div>
                                </div>
                                <button onClick={copyTenty} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${copiedTenty ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                                    {copiedTenty ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy Command</>}
                                </button>
                            </div>

                            {(os === 'linux' || os === 'mac') && (
                                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remote Control Engine</label>
                                    <div className="p-4 rounded-lg bg-gray-950 border border-gray-800 font-mono text-sm text-green-400 break-all relative">
                                        <FaTerminal className="absolute top-3 left-3 text-gray-600" />
                                        <div className="pl-6 select-all">{mcCommand}</div>
                                    </div>
                                    <button onClick={copyMc} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${copiedMc ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                                        {copiedMc ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy Command</>}
                                    </button>
                                </div>
                            )}

                            {os === 'windows' && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Remote Control Engine</div>
                                    <button 
                                        onClick={handleDownload} 
                                        disabled={isDownloading}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        {isDownloading ? "Downloading Securely..." : <><FaDownload /> Download Installer (.exe)</>}
                                    </button>
                                </div>
                            )}
                            
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};