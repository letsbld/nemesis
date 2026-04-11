'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/SystemUI';
import { FaBoxOpen, FaSearch, FaFolderOpen, FaCalendarAlt } from 'react-icons/fa';

interface SoftwareItem {
    name?: string;
    version?: string;
    vendor?: string;
    install_time?: string;
    location?: string;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr.trim() === '') return 'Unknown Date';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Unknown Date';
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    } catch (e) {
        return 'Unknown Date';
    }
};

export default function SoftwareTable({ packages }: { packages: any }) {
    const [search, setSearch] = useState('');

    const safePackages: SoftwareItem[] = Array.isArray(packages) ? packages : [];

    const filtered = safePackages.filter(item => {
        const name = String(item?.name || '').toLowerCase();
        const vendor = String(item?.vendor || '').toLowerCase();
        const q = search.toLowerCase().trim();
        return name.includes(q) || vendor.includes(q);
    });

    return (
        <Card className="p-0 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <FaBoxOpen size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Installed Packages</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{safePackages.length} items found</p>
                    </div>
                </div>
                
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search software..." className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 w-[25%]">Name</th>
                            <th className="px-6 py-3 w-[15%]">Version</th>
                            <th className="px-6 py-3 w-[15%]">Install Date</th>
                            <th className="px-6 py-3 w-[20%]">Vendor</th>
                            <th className="px-6 py-3 w-[25%]">Path</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">No software found.</td></tr>
                        ) : (
                            filtered.map((item, idx) => (
                                <motion.tr 
                                    key={idx} 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{item.name || 'Unknown'}</td>
                                    <td className="px-6 py-3">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                                            {item.version || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {item.install_time && item.install_time.trim() !== '' && <FaCalendarAlt className="opacity-50" />}
                                            {formatDate(item.install_time)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{item.vendor || '-'}</td>
                                    <td className="px-6 py-3 text-gray-400 text-xs truncate max-w-[200px]" title={item.location || ''}>
                                        <div className="flex items-center gap-2">
                                            {item.location && item.location !== '-' && <FaFolderOpen className="opacity-50" />}
                                            <span className="truncate">{item.location || '-'}</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}