'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { UserList } from '@/components/admin/UserList';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { EditUserForm } from '@/components/admin/EditUserForm';
import { CSVImportForm } from '@/components/admin/CSVImportForm';

import { PasswordFilter } from '@/components/admin/PasswordFilter';
import { CreationDateFilter } from '@/components/admin/CreationDateFilter';
import { MFAFilter } from '@/components/admin/MFAFilter';

import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { useSearch } from '@/context/SearchContext';

import { Input } from '@/components/ui/input';
import CustomButton from '@/components/ui/customButton';
import { CiCirclePlus } from "react-icons/ci";
import { TbFileImport } from "react-icons/tb";
import { MdDeleteForever } from "react-icons/md";

import { Loader } from '@/components/ui/loader';
import { Pagination } from "flowbite-react";

import { DeleteConfirmModal } from '@/components/ui/deleteConfirmModal';


const UsersPage = () => {
    const router = useRouter();
    const { searchQuery, setSearchQuery } = useSearch();

    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [showCSVImport, setShowCSVImport] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
    const [user, setUser] = useState<any>(null);

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    // Filters
    const [passwordFilter, setPasswordFilter] = useState<'all' | 'set' | 'not-set'>('all');
    const [creationDateFilter, setCreationDateFilter] = useState<'latest' | 'oldest'>('latest');
    const [mfaFilter, setMfaFilter] = useState<'all' | 'yes' | 'no'>('all');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // DELETE MODAL STATES
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState<"single" | "multiple">("single");
    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    const [deleteNames, setDeleteNames] = useState<string[]>([]); // username list


    // 1. Auth Check
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('authUser');

        if (!token || !userStr) {
            setStatus('unauthenticated');
            router.push('/auth/user/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);

            if (parsedUser.role !== 'admin') {
                setStatus('unauthenticated');
                router.push('/auth/user/login');
                return;
            }

            setStatus('authenticated');
        } catch {
            setStatus('unauthenticated');
            router.push('/auth/user/login');
        }
    }, [router]);


    // 2. Fetch Users After Auth
    useEffect(() => {
        if (status === 'authenticated' && user?.role === 'admin') {
            fetchUsers();
        }
    }, [status, user]);



    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/user');
            setUsers([...data]);
            setFilteredUsers([...data]);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };


    // 3. FILTERING
    useEffect(() => {
        let filtered = [...users];

        // Search Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.username.toLowerCase().includes(q) ||
                u.display_name.toLowerCase().includes(q) ||
                u.first_name.toLowerCase().includes(q) ||
                u.last_name.toLowerCase().includes(q) ||
                u.company_email.toLowerCase().includes(q)
            );
        }

        // Password Filter
        if (passwordFilter === 'set') {
            filtered = filtered.filter(u => u.password);
        } else if (passwordFilter === 'not-set') {
            filtered = filtered.filter(u => !u.password);
        }

        // MFA Filter
        if (mfaFilter === 'yes') filtered = filtered.filter(u => u.totp_enabled);
        if (mfaFilter === 'no') filtered = filtered.filter(u => !u.totp_enabled);

        // Date Filter
        if (selectedDate) {
            const start = new Date(selectedDate).setHours(0, 0, 0, 0);
            const end = new Date(selectedDate).setHours(23, 59, 59, 999);

            filtered = filtered.filter(u => {
                if (!u.created_at) return false;
                const time = new Date(u.created_at).getTime();
                return time >= start && time <= end;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;

            return creationDateFilter === 'latest' ? tB - tA : tA - tB;
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [searchQuery, users, passwordFilter, mfaFilter, creationDateFilter, selectedDate]);




    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedUserIds([]);
    };


    // 4. CREATE USER
    const handleCreateUser = async (userData: CreateUserData) => {
        setIsCreating(true);
        try {
            const newUser = await apiFetch('/user', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' },
            });

            setUsers(prev => [...prev, newUser]);
            setShowCreateForm(false);
            toast.success('User created successfully!');
        } catch {
            toast.error('Failed to create user.');
        } finally {
            setIsCreating(false);
        }
    };


    // 5. UPDATE USER
    const handleUpdateUser = async (userId: string, userData: Partial<CreateUserData>) => {
        setIsUpdating(true);
        try {
            const updatedUser = await apiFetch(`/user/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' },
            });

            setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
            setShowEditForm(false);
            setEditingUser(null);
            toast.success('User updated successfully!');
        } catch {
            toast.error('Failed to update user.');
        } finally {
            setIsUpdating(false);
        }
    };



    // 6. DELETE USER HANDLER (MODAL → CONFIRM)
    const handleConfirmDelete = async () => {
        try {
            if (deleteMode === "single") {
                const id = deleteIds[0];
                const name = deleteNames[0];

                await apiFetch(`/user/${id}`, { method: "DELETE" });

                setUsers(prev => prev.filter(u => u.id !== id));
                toast.success(`User "${name}" deleted.`);
            } else {
                await Promise.all(
                    deleteIds.map(id =>
                        apiFetch(`/user/${id}`, { method: "DELETE" })
                    )
                );

                setUsers(prev => prev.filter(u => !deleteIds.includes(u.id)));
                toast.success(`Deleted ${deleteIds.length} users.`);
            }
        } catch {
            toast.error("Failed to delete user(s).");
        }

        setOpenDeleteModal(false);
        setDeleteIds([]);
        setDeleteNames([]);
    };



    // Reset Password
    const handleResetPassword = async (userId: string) => {
        if (!confirm("Reset this user's password?")) return;

        try {
            const data = await apiFetch(`/user/${userId}/reset-password`, {
                method: 'POST',
            });
            toast.success(`Password reset! New password: ${data.newPassword}`);
        } catch {
            toast.error('Failed to reset password.');
        }
    };





    // ----------- CONDITIONAL SCREENS ----------------

    if (status === 'loading') return <Loader />;
    if (status !== 'authenticated') return <div>Redirecting...</div>;

    if (showCreateForm)
        return (
            <CreateUserForm
                onSubmit={handleCreateUser}
                onCancel={() => setShowCreateForm(false)}
                isLoading={isCreating}
            />
        );

    if (showEditForm && editingUser)
        return (
            <EditUserForm
                user={editingUser}
                onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
                onCancel={() => { setShowEditForm(false); setEditingUser(null); }}
                isLoading={isUpdating}
            />
        );

    if (showCSVImport)
        return (
            <CSVImportForm
                onImportComplete={() => {
                    fetchUsers();
                    setShowCSVImport(false);
                }}
                onClose={() => setShowCSVImport(false)}
            />
        );




    return (
        <div className="min-h-screen bg-white dark:bg-[#101828]">

            <div className="m-1">

                {/* HEADER */}
                <div className="flex justify-between">
                    <h1 className="text-4xl font-bold text-[#101828] dark:text-white">Users</h1>

                    {users.length > 0 && (
                        selectedUserIds.length > 0 ? (
                            <div className="flex gap-3">
                                <CustomButton
                                    startIcon={<MdDeleteForever className="w-5 h-5" />}
                                    name={`Delete Selected (${selectedUserIds.length})`}
                                    onClick={() => {
                                        const selectedUsernames = users
                                            .filter(u => selectedUserIds.includes(u.id))
                                            .map(u => u.username);

                                        setDeleteMode("multiple");
                                        setDeleteIds(selectedUserIds);
                                        setDeleteNames(selectedUsernames);
                                        setOpenDeleteModal(true);
                                    }}
                                    btnType="button"
                                    style="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                                />

                                <button
                                    onClick={() => setSelectedUserIds([])}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                                >
                                    Clear selection
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <CustomButton
                                    startIcon={<TbFileImport className="w-4 h-4" />}
                                    name="Import CSV"
                                    onClick={() => setShowCSVImport(true)}
                                    btnType="button"
                                    style="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2"
                                    loading={isLoading}
                                />

                                <CustomButton
                                    startIcon={<CiCirclePlus className="w-4 h-4" />}
                                    name="New User"
                                    onClick={() => setShowCreateForm(true)}
                                    btnType="button"
                                    style="bg-[#1447E6] hover:bg-blue-700 text-md font-[300] text-white px-4 py-2"
                                    loading={isLoading}
                                />
                            </div>
                        )
                    )}
                </div>



                {/* SEARCH + FILTERS */}
                <div className="flex flex-row">

                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mt-4 p-2 border h-[36px] border-[#333e4f] shadow-sm w-full max-w-sm dark:text-gray-300 dark:bg-[#101828]"
                        placeholder="Search users..."
                    />

                    <PasswordFilter passwordFilter={passwordFilter} onFilterChange={setPasswordFilter} />
                    <CreationDateFilter selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    <MFAFilter mfaFilter={mfaFilter} onFilterChange={setMfaFilter} />
                </div>
            </div>



            {/* USER LIST */}
            <UserList
                users={currentUsers}
                selectedUserIds={selectedUserIds}
                onSelectionChange={setSelectedUserIds}
                isLoading={isLoading}
                onEditUser={(user) => { setEditingUser(user); setShowEditForm(true); }}

                onDeleteUser={async (userId: string, username: string) => {
                    setDeleteMode("single");
                    setDeleteIds([userId]);
                    setDeleteNames([username]);       // USE USERNAME HERE
                    setOpenDeleteModal(true);
                }}

                onResetPassword={handleResetPassword}
                onImportCSV={() => setShowCSVImport(true)}
                onCreateUser={() => setShowCreateForm(true)}

                onCreationDateSort={() =>
                    setCreationDateFilter(prev => prev === 'latest' ? 'oldest' : 'latest')
                }
                creationDateSortOrder={creationDateFilter}
            />




            {/* PAGINATION */}
            {filteredUsers.length > usersPerPage && (
                <div className="flex justify-between items-center mt-6 px-4 pb-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                    </div>

                    <div className="flex overflow-x-auto sm:justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            showIcons
                        />
                    </div>
                </div>
            )}



            {/* DELETE MODAL */}
            <DeleteConfirmModal
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                names={deleteNames}          // usernames array
            />

        </div>
    );
};

export default UsersPage;
