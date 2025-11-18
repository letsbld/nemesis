'use client';

import React, { useState, useEffect } from 'react';
import { IoGrid } from "react-icons/io5";
import CustomButton from '@/components/ui/customButton';
import { Modal } from "flowbite-react";
import { BsThreeDots } from "react-icons/bs";
import { Badge } from "flowbite-react";

import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { UserGroupMembersList } from '@/components/admin/userGroupMembersList';


import { CiCirclePlus } from "react-icons/ci";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
    Users, 
    Plus, 
    Search, 
    List, 
    Edit, 
    Trash2,
    Clock,
} from 'lucide-react';
import {formatDate} from '@/lib/date-utils';
import { UserGroupData, CreateUserGroupData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { Loader } from '@/components/ui/loader';
import { CreateUserGroupForm } from '@/components/admin/CreateUserGroupForm';
import { Card, Dropdown, DropdownItem } from "flowbite-react";


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
    const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<UserGroupData | null>(null);

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
                
                // Fetch member counts for each group
                const counts: Record<string, number> = {};
                await Promise.all(
                    response.map(async (group: UserGroupData) => {
                        try {
                            const members = await apiFetch(`/user-group/${group.id}`);
                            counts[group.id] = members.users?.length || 0;
                        } catch (error) {
                            counts[group.id] = 0;
                        }
                    })
                );
                setMemberCounts(counts);
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
            toast.error('Failed to load user groups');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async (groupData: CreateUserGroupData) => {
        setIsSubmitting(true);
        try {
            const response = await apiFetch('/user-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupData),
            });

            if (response) {
                toast.success('User group created successfully!');
                setShowCreateModal(false);
                fetchGroups();
            }
        } catch (error) {
            console.error('Error creating user group:', error);
            toast.error('Failed to create user group');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateGroup = async (groupData: CreateUserGroupData) => {
        if (!selectedGroup) return;
        
        setIsSubmitting(true);
        try {
            const response = await apiFetch(`/user-group/${selectedGroup.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupData),
            });

            if (response) {
                toast.success('User group updated successfully!');
                setShowEditModal(false);
                setSelectedGroup(null);
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
        setShowEditModal(true);
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedGroup(null);
    };

    const handleViewMembers = (group: UserGroupData) => {
        const data = apiFetch(`/user-group/${group.id}`);
        setSelectedGroupForMembers(group);
        setShowMembersModal(true);
        <UserGroupMembersList groupId={selectedGroupForMembers?.id || ''} onMemberRemoved={fetchGroups} />
    };

    const closeMembersModal = () => {
        setShowMembersModal(false);
        setSelectedGroupForMembers(null);
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            User Groups
                        </h1>

                <div className="flex flex-col sm:flex-row pt-6 pb-6 items-center justify-between bg-white dark:bg-[#101828] ">
                    <div className="relative ">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4  dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    {filteredGroups.length === 0 ? (null) : (
                    <div className="flex items-center gap-2 bg-white dark:bg-[#101828] p-1 rounded-lg">
                    <CustomButton
                        startIcon={<CiCirclePlus size={20} />}
                        name="Add user group"
                        
                        onClick={() => setShowCreateModal(true)}
                        style="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                    />
                   
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-50 border border-1px border-blue-600 dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400  border border-1px border-gray-100'}`}
                        >
                            <IoGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-50 dark:bg-gray-700 border border-1px  border-blue-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400  border border-1px border-gray-100'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>)}
                </div>
                
                
            </div>

            {/* Groups Display */}
            {viewMode === 'grid' && filteredGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <Card
                            key={group.id}
                            className="bg-white dark:bg-[#1a2332] border-gray-200 dark:border-gray-700"
                            theme={{
                                root: {
                                    base: "flex rounded-lg border bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
                                    children: "flex h-full flex-col justify-center gap-4 p-6"
                                }
                            }}
                        >
                            {/* Header with title and three-dot menu */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  
                                    <div className="flex flex-row gap-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {group.name}
                                        </h3>
                                        <Badge 
                                            className="bg-[#EEF6FF] hover:bg-[#D6E4FF] dark:hover:bg-[#466cdd] border-[#BEDBFF] text-[#1C398E] dark:bg-[#1C398E] dark:border-[#1C398E] dark:text-[#EEF6FF] cursor-pointer" 
                                            onClick={() => handleViewMembers(group)}
                                        >
                                            <span>
                                                {memberCounts[group.id] || 0} {memberCounts[group.id] === 1 ? 'member' : 'members'}
                                            </span>
                                        </Badge>             
                                    </div>
                                </div>
                                <Dropdown
                                    label=""
                                    dismissOnClick={true}
                                    renderTrigger={() => (
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                            <BsThreeDots size={20} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    )}
                                    theme={{
                                        floating: {
                                            base: "z-10 w-fit divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600",
                                            content: "py-1 text-sm text-gray-700 dark:text-gray-200",
                                            target: "w-fit"
                                        }
                                    }}
                                >
                                    <DropdownItem
                                        onClick={() => openEditModal(group)}
                                        className="flex items-center gap-2 dark:hover:bg-gray-600"
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="flex items-center gap-2 text-red-600 dark:text-red-400 dark:hover:bg-gray-600"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </DropdownItem>
                                </Dropdown>
                            </div>

                            {/* Description */}
                            {group.description ? (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                    {group.description}
                                </p>
                            ) : (
                                <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                                    No description
                                </p>
                            )}

                            {/* Created date */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <Clock size={16} />
                                <span>Created {formatDate(group.created_at)}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                <Table hoverable>
                    <TableHead >
                    <TableRow>
                        <TableHeadCell >
                        Name
                        </TableHeadCell>
                        <TableHeadCell >
                        Description
                        </TableHeadCell>
                        <TableHeadCell >
                        Total Users
                        </TableHeadCell>
                        <TableHeadCell >
                        Created Date
                        </TableHeadCell>
                        <TableHeadCell >
                        Actions
                        </TableHeadCell>
                    </TableRow>
                    </TableHead>

                    <TableBody className="divide-y">
                    {filteredGroups.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            No user groups yet
                                        </h3>
                                       
                                       
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center gap-2"
                                            >
                                                <Plus size={20} />
                                                Add User Group
                                            </button>
                                       
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredGroups.map((group) => (
                        <TableRow
                        key={group.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                        {/* NAME */}
                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                {group.name}
                        </TableCell>

                        {/* DESCRIPTION */}
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {group.description || "-"}
                        </TableCell>

                        {/* TOTAL USERS */}
                        <TableCell className="px-6 py-4">
                            <Badge
                                color="info"
                                onClick={() => handleViewMembers(group)}
                                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors inline-flex items-center gap-2"
                            >
                
                                {memberCounts[group.id] || 0}
                            </Badge>
                        </TableCell>

                        {/* CREATED DATE */}
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {formatDate(group.created_at)}
                        </TableCell>

                        {/* ACTIONS - THREE DOTS MENU */}
                        <TableCell className="px-6 py-4 text-right">
                            <Dropdown
                                    label=""
                                    dismissOnClick={true}
                                    renderTrigger={() => (
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                            <BsThreeDots size={20} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    )}
                                    theme={{
                                        floating: {
                                            base: "z-10 w-fit divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600",
                                            content: "py-1 text-sm text-gray-700 dark:text-gray-200",
                                            target: "w-fit"
                                        }
                                    }}
                                >
                                    <DropdownItem
                                        onClick={() => openEditModal(group)}
                                        className="flex items-center gap-2 dark:hover:bg-gray-600"
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="flex items-center gap-2 text-red-600 dark:text-red-400 dark:hover:bg-gray-600"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </DropdownItem>
                                </Dropdown>
                        </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                show={showCreateModal || showEditModal}
                onClose={closeModals}
                size="md"
            >
                <CreateUserGroupForm
                    onSubmit={showCreateModal ? handleCreateGroup : handleUpdateGroup}
                    onCancel={closeModals}
                    isLoading={isSubmitting}
                    initialData={selectedGroup}
                    mode={showCreateModal ? 'create' : 'edit'}
                />
            </Modal>

            {/* Members List Modal */}
            <Modal
                show={showMembersModal}
                onClose={closeMembersModal}
                size="3xl"
            >
                <div className="bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedGroupForMembers?.name} - Members
                        </h2>
                    </div>
                    <div className="p-6">
                        <UserGroupMembersList groupId={selectedGroupForMembers?.id || ''} onMemberRemoved={fetchGroups} />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserGroupsPage;
