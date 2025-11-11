'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Check, Trash2, AlertTriangle, Share2, X, Clock, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiFetch';
import { Commet } from 'react-loading-indicators';
import { useRouter } from 'next/navigation';

type Credential = { id: number; user_id: string; website: string; username: string; password: string; created_at: string; custom_username: string | null; shared_with_user_ids: string[] | null; expires_at: string | null; };
type VerifiedUser = { id: string; display_name: string; company_email: string; };

const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
    const calculateRemainingTime = useCallback(() => {
        const now = new Date().getTime();
        const expirationTime = new Date(expiresAt).getTime();
        const distance = expirationTime - now;

        if (distance < 0) { return null; }
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }, [expiresAt]);

    const [remainingTime, setRemainingTime] = useState(calculateRemainingTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(calculateRemainingTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [calculateRemainingTime]);

    if (!remainingTime) return null;

    return (
        <div className="flex items-center gap-1.5 text-orange-600 font-medium" title={`Expires: ${new Date(expiresAt).toLocaleString()}`}>
            <Clock size={14} />
            <span className="text-xs">{remainingTime}</span>
        </div>
    );
};

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

const ShareModal = ({ user, credential, onClose, onShare }: { user: any, credential: Credential, onClose: () => void, onShare: (id: number, emails: string[], duration: number) => Promise<void> }) => {
    const [durationHours, setDurationHours] = useState(24);
    const [emailInput, setEmailInput] = useState('');
    const [recipients, setRecipients] = useState<VerifiedUser[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState('');
    const timeOptions = [{ label: '1 Hour', value: 1 }, { label: '8 Hours', value: 8 }, { label: '24 Hours', value: 24 }, { label: 'Permanent', value: 0 }];

    const handleAddRecipient = async () => {
        setError('');
        if (!emailInput) { setError('Please enter an email.'); return; }
        if (user && emailInput === user.company_email) { setError('You cannot share a password with yourself.'); return; }
        if (recipients.some(r => r.company_email === emailInput)) { setError('This user has already been added.'); return; }
        
        setIsVerifying(true);
        try {
            const data = await apiFetch(`/password-generator/user/find-user?email=${encodeURIComponent(emailInput)}`);
            setRecipients(prev => [...prev, data]);
            setEmailInput('');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRemoveRecipient = (email: string) => { setRecipients(prev => prev.filter(r => r.company_email !== email)); };

    const handleShare = async () => {
        if (recipients.length === 0) { setError('Please add at least one recipient.'); return; }
        setError(''); setIsSharing(true);
        try {
            const recipientEmails = recipients.map(r => r.company_email);
            await onShare(credential.id, recipientEmails, durationHours);
            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Share '{credential.website}'</h2>
                    <p className="text-sm text-gray-500 mt-1">Add recipients to share this credential securely.</p>
                </div>
                <div className="p-6 space-y-5">
                    {error && <p className="text-red-500 text-sm -mt-2 mb-3 text-center">{error}</p>}
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Expires in:</label>
                        <div className="grid grid-cols-4 gap-2">
                            {timeOptions.map(option => (<button key={option.value} onClick={() => setDurationHours(option.value)} className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${durationHours === option.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}> {option.label} </button>))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="recipient-email" className="text-sm font-medium text-gray-600 mb-2 block">Recipient's Company Email:</label>
                        <div className="flex gap-2">
                            <input id="recipient-email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="user@company.com" className="flex-grow bg-gray-50 border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-blue-500 focus:border-blue-500" />
                            <button onClick={handleAddRecipient} disabled={isVerifying} className="px-4 py-2 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2">
                                <UserPlus size={16} /> {isVerifying ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                    {recipients.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <AnimatePresence>
                                {recipients.map(user => (
                                    <motion.div key={user.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex items-center justify-between bg-gray-100 rounded-lg p-2.5">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="text-gray-600" size={18} />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{user.display_name}</p>
                                                <p className="text-xs text-gray-500">{user.company_email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveRecipient(user.company_email)} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-200">
                                            <X size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleShare} disabled={isSharing || recipients.length === 0} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                        {isSharing ? 'Sharing...' : `Share with ${recipients.length} User(s)`}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const DeleteConfirmationModal = ({ credential, onClose, onDelete }: { 
    credential: Credential; 
    onClose: () => void; 
    onDelete: (id: number) => Promise<void>; 
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onDelete(credential.id);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }} 
                className="bg-white rounded-xl shadow-xl w-full max-w-md" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto flex items-center justify-center bg-red-100 rounded-full">
                        <AlertTriangle size={40} className="text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mt-4">Are you sure?</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Do you really want to delete the password for D<strong>{credential.website}</strong>?
                    </p>
                    <p className="text-sm text-red-600 font-medium mt-2">
                        This action cannot be undone and will be permanently lost.
                    </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300">
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function ManagePasswordsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [visiblePasswordId, setVisiblePasswordId] = useState<number | null>(null);
    const [copiedPasswordId, setCopiedPasswordId] = useState<number | null>(null);
    const [showShareModal, setShowShareModal] = useState<Credential | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<Credential | null>(null);

    const fetchCredentials = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            const data = await apiFetch('/password-generator/user/passwords');
            if (Array.isArray(data)) { setCredentials(data); }
            else { setCredentials([]); throw new Error("Received invalid data from server."); }
        } catch (err) {
            setError((err as Error).message); console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

    const filteredCredentials = useMemo(() => {
        const now = new Date();
        let filtered = credentials;

        filtered = filtered.filter(cred => {
            const isOwner = user?.id === cred.user_id;
            if (!isOwner && cred.expires_at && new Date(cred.expires_at) < now) {
                return false;
            }
            return true;
        });

        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return filtered;
        
        return filtered.filter(cred =>
            cred.website.toLowerCase().includes(lowercasedTerm) ||
            cred.username.toLowerCase().includes(lowercasedTerm)
        );
    }, [credentials, searchTerm, user?.id]);

    const handleCopyToClipboard = (password: string, id: number) => { navigator.clipboard.writeText(password); setCopiedPasswordId(id); setTimeout(() => setCopiedPasswordId(null), 2000); };

    const handleConfirmDelete = async (id: number) => {
        setApiError(null);
        try {
            await apiFetch(`/password-generator/user/passwords/${id}`, { method: 'DELETE' });
            setCredentials(prev => prev.filter(c => c.id !== id));
            router.refresh();
        } catch(err) {
            setApiError((err as Error).message);
            setTimeout(() => setApiError(null), 5000);
        } finally {
            setShowDeleteModal(null);
        }
    };

    const handleShareSubmit = async (credentialId: number, recipientEmails: string[], durationHours: number) => {
        const customHeaders = {
            'Content-Type': 'application/json',
            'x-user-id': user?.id,
            'x-user-name': user?.display_name || user?.username,
        };

        await apiFetch('/password-generator/user/share', {
            method: 'POST',
            body: JSON.stringify({ credentialId, recipientEmails, durationHours }),
            headers: customHeaders, 
        });
        fetchCredentials();
        router.refresh();
    };

    if (isLoading) { return (<div className="flex justify-center items-center h-96"><Commet color="#2563eb" size="medium" text="" /></div>); }
    if (error) { return (<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"> <AlertTriangle className="mx-auto text-red-400 mb-4" size={40} /> <h3 className="text-lg font-semibold text-red-600">Could not load credentials</h3> <p className="text-sm text-gray-500 mt-1">{error}</p> <button onClick={fetchCredentials} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button> </div>); }

    return (
        <>
            <AnimatePresence>
                {apiError && <ErrorPopup message={apiError} onClose={() => setApiError(null)} />}
                {showShareModal && <ShareModal user={user} credential={showShareModal} onClose={() => setShowShareModal(null)} onShare={handleShareSubmit} />}
                {showDeleteModal && (
                    <DeleteConfirmationModal
                        credential={showDeleteModal}
                        onClose={() => setShowDeleteModal(null)}
                        onDelete={handleConfirmDelete}
                    />
                )}
            </AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-lg font-bold text-gray-900">Your Password Vault</h2>
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCredentials && filteredCredentials.length > 0 ? (filteredCredentials.map((cred) => {
                                    const isOwner = user?.id === cred.user_id;
                                    return (
                                        <tr key={cred.id} className="hover:bg-gray-50 align-middle">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 truncate">{cred.website}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate">
                                                {cred.custom_username || cred.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{visiblePasswordId === cred.id ? cred.password : '••••••••••••'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                    <span>{new Date(cred.created_at).toLocaleDateString()}</span>
                                                    {cred.expires_at ? (
                                                        <CountdownTimer expiresAt={cred.expires_at} />
                                                    ) : (
                                                        <div className="h-[18px]"></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => setVisiblePasswordId(visiblePasswordId === cred.id ? null : cred.id)} className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                                        {visiblePasswordId === cred.id ? 'Hide' : 'Show'}
                                                    </button>
                                                    <button onClick={() => handleCopyToClipboard(cred.password, cred.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-colors" title="Copy Password">
                                                        {copiedPasswordId === cred.id ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                                    </button>
                                                    {isOwner && (
                                                        <>
                                                            <button onClick={() => setShowShareModal(cred)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-colors" title="Share Password">
                                                                <Share2 size={18} />
                                                            </button>
                                                            <button onClick={() => setShowDeleteModal(cred)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-600 transition-colors" title="Delete">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                                ) : (
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
