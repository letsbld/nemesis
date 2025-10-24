'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import {apiFetch} from '@/lib/apiFetch'


type Credential = { id: number; website: string; username: string; password: string; created_at: string; };

const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void; }) => (
    <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 z-50"
    >
        <AlertTriangle size={20} />
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 font-bold opacity-70 hover:opacity-100">X</button>
    </motion.div>
);

export default function ManagePasswordsPage({ onCredentialChange }: { onCredentialChange: () => void }) {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [visiblePasswordId, setVisiblePasswordId] = useState<number | null>(null);
    const [copiedPasswordId, setCopiedPasswordId] = useState<number | null>(null);

    const fetchCredentials = useCallback(async () => {
        setIsLoading(true); setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('You are not logged in.'); setIsLoading(false); return;
        }
        try {
            const response = await apiFetch('/password-generator/get-passwords', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json(); throw new Error(errorData.error || 'Failed to fetch credentials.');
            }
            const data: Credential[] = await response.json(); setCredentials(data);
        } catch (err) {
            setError((err as Error).message); console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

    const filteredCredentials = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return credentials;
        return credentials.filter(cred =>
            cred.website.toLowerCase().includes(lowercasedTerm) ||
            cred.username.toLowerCase().includes(lowercasedTerm)
        );
    }, [credentials, searchTerm]);

    const handleCopyToClipboard = (password: string, id: number) => {
        navigator.clipboard.writeText(password);
        setCopiedPasswordId(id); setTimeout(() => setCopiedPasswordId(null), 2000);
    };
    
    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to permanently delete this credential?')) return;
        
        const token = localStorage.getItem('authToken');
        try {
             const response = await apiFetch(`/password-generator/delete-password/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const errorData = await response.json(); throw new Error(errorData.error || 'Failed to delete credential.');
            }
            setCredentials(prev => prev.filter(c => c.id !== id));
            onCredentialChange(); // Trigger a refresh on the parent
        } catch(err) {
            setDeleteError((err as Error).message);
            setTimeout(() => setDeleteError(null), 5000);
        }
    };

    if (isLoading) {
        return (
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div><div className="w-full h-72 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <AlertTriangle className="mx-auto text-red-400 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-red-600">Could not load credentials</h3>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
                <button onClick={fetchCredentials} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
            </div>
        );
    }

    return (
        <>
            <AnimatePresence>
                {deleteError && <ErrorPopup message={deleteError} onClose={() => setDeleteError(null)} />}
            </AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-lg font-bold text-gray-800">Manage Passwords</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Search by website..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCredentials.length > 0 ? ( filteredCredentials.map((cred) => (
                                    <tr key={cred.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{cred.website}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cred.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{visiblePasswordId === cred.id ? cred.password : '••••••••••••'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(cred.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setVisiblePasswordId(visiblePasswordId === cred.id ? null : cred.id)} 
                                                    className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50 transition-colors"
                                                >
                                                    {visiblePasswordId === cred.id ? 'Hide Password' : 'Show Password'}
                                                </button>
                                                <button onClick={() => handleCopyToClipboard(cred.password, cred.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600 transition-colors" title="Copy Password">
                                                    {copiedPasswordId === cred.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                                </button>
                                                <button onClick={() => handleDelete(cred.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600 transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))) : (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">No saved passwords found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </>
    );
}