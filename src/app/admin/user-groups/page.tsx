'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoGrid } from "react-icons/io5";

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
    Users, 
    Plus, 
    Search, 
    Grid3x3, 
    List, 
    Edit, 
    Trash2, 
    UserPlus,
    Settings,
    Shield,
    Clock,
    X
} from 'lucide-react';
import { UserGroupData, CreateUserGroupData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { Loader } from '@/components/ui/loader';

const UserGroupsPage = () => {
    const router = useRouter();
    const [groups, setGroups] = useState<UserGroupData[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<UserGroupData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<UserGroupData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState<CreateUserGroupData>({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        // Filter groups based on search query
        if (searchQuery.trim() === '') {
            setFilteredGroups(groups);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = groups.filter(group => 
                group.name.toLowerCase().includes(query) ||
                (group.description && group.description.toLowerCase().includes(query))
            );
            setFilteredGroups(filtered);
        }
    }, [searchQuery, groups]);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/user-group');
            if (response) {
                setGroups(response);
                setFilteredGroups(response);
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
            toast.error('Failed to load user groups');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await apiFetch('/user-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response) {
                toast.success('User group created successfully!');
                setShowCreateModal(false);
                setFormData({ name: '', description: '' });
                fetchGroups();
            }
        } catch (error) {
            console.error('Error creating user group:', error);
            toast.error('Failed to create user group');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;
        
        setIsSubmitting(true);
        try {
            const response = await apiFetch(`/user-group/${selectedGroup.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response) {
                toast.success('User group updated successfully!');
                setShowEditModal(false);
                setSelectedGroup(null);
                setFormData({ name: '', description: '' });
                fetchGroups();
            }
        } catch (error) {
            console.error('Error updating user group:', error);
            toast.error('Failed to update user group');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Are you sure you want to delete this user group?')) return;

        try {
            await apiFetch(`/user-group/${groupId}`, {
                method: 'DELETE',
            });
            toast.success('User group deleted successfully!');
            fetchGroups();
        } catch (error) {
            console.error('Error deleting user group:', error);
            toast.error('Failed to delete user group');
        }
    };

    const openEditModal = (group: UserGroupData) => {
        setSelectedGroup(group);
        setFormData({
            name: group.name,
            description: group.description || ''
        });
        setShowEditModal(true);
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedGroup(null);
        setFormData({ name: '', description: '' });
    };

    const formatDate = (dateString: Date | string) => {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#101828]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#101828]">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            User Groups
                        </h1>
                        
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg transition-colors"
                    >
                        <Plus size={20} />
                        Create Group
                    </motion.button>
                </div>

                {/* Search and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1a2332] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search groups by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            <IoGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Groups</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{groups.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <UserPlus className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Groups</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{groups.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1a2332] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Shield className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Filtered Results</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredGroups.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Groups Display */}
            {filteredGroups.length === 0 ? (
                <div className="bg-white dark:bg-[#1a2332] rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Users className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {searchQuery ? 'No groups found' : 'No user groups yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Create your first user group to get started'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Create First Group
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#1a2332] rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Users className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {group.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            ID: {group.id.slice(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {group.description && (
                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {group.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <Clock size={16} />
                                <span>Created {formatDate(group.created_at)}</span>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => router.push(`/admin/user-groups/${group.id}/members`)}
                                    className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium transition-colors"
                                >
                                    View Members
                                </button>
                                <button
                                    onClick={() => openEditModal(group)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDeleteGroup(group.id)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Group
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredGroups.map((group) => (
                                <motion.tr
                                    key={group.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Users className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {group.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {group.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {group.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {formatDate(group.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/admin/user-groups/${group.id}/members`)}
                                                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm font-medium"
                                            >
                                                Members
                                            </button>
                                            <button
                                                onClick={() => openEditModal(group)}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(showCreateModal || showEditModal) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={closeModals}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1a2332] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {showCreateModal ? 'Create User Group' : 'Edit User Group'}
                                </h2>
                                <button
                                    onClick={closeModals}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={showCreateModal ? handleCreateGroup : handleUpdateGroup} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Group Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                                        placeholder="Enter group name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                                        placeholder="Enter group description"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModals}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader />
                                                <span>{showCreateModal ? 'Creating...' : 'Updating...'}</span>
                                            </>
                                        ) : (
                                            <span>{showCreateModal ? 'Create Group' : 'Update Group'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserGroupsPage;
