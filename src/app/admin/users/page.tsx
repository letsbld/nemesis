'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserList } from '@/components/admin/UserList';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { EditUserForm } from '@/components/admin/EditUserForm';
import { CSVImportForm } from '@/components/admin/CSVImportForm';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { useSearch } from '@/context/SearchContext';
import { Input} from '@/components/ui/input';
import CustomButton from '@/components/ui/customButton';
import { CiCirclePlus } from "react-icons/ci";
import { TbFileImport } from "react-icons/tb";
import Loader from '@/components/ui/loader';
import { MdDeleteForever } from "react-icons/md";





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
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
        'loading'
    );
    const [user, setUser] = useState<any>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    // Filter states
    const [passwordFilter, setPasswordFilter] = useState<'all' | 'set' | 'not-set'>('all');
    const [creationDateFilter, setCreationDateFilter] = useState<'all' | 'latest' | 'oldest'>('all');
    const [mfaFilter, setMfaFilter] = useState<'all' | 'yes' | 'no'>('all');
    const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);
    const [showCreationDateDropdown, setShowCreationDateDropdown] = useState(false);
    const [showMfaDropdown, setShowMfaDropdown] = useState(false);

    // Check authentication and admin role
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

    // Fetch users on component mount (only after auth check)
    useEffect(() => {
        if (status === 'authenticated' && user && user.role === 'admin') {
            fetchUsers();
        }
    }, [status, user]);

    // Filter users based on search query
    useEffect(() => {
        let filtered = users;

        // Apply search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user => 
                user.first_name.toLowerCase().includes(query) ||
                user.last_name.toLowerCase().includes(query) ||
                user.display_name.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.company_email.toLowerCase().includes(query) ||
                (user.description && user.description.toLowerCase().includes(query))
            );
        }

        // Apply password filter
        if (passwordFilter === 'set') {
            filtered = filtered.filter(user => user.password);
        } else if (passwordFilter === 'not-set') {
            filtered = filtered.filter(user => !user.password);
        }

        // Apply MFA filter
        if (mfaFilter === 'yes') {
            filtered = filtered.filter(user => user.totp_enabled);
        } else if (mfaFilter === 'no') {
            filtered = filtered.filter(user => !user.totp_enabled);
        }

        // Apply creation date filter (sort)
        if (creationDateFilter === 'latest') {
            filtered = [...filtered].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA; // Latest first
            });
        } else if (creationDateFilter === 'oldest') {
            filtered = [...filtered].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateA - dateB; // Oldest first
            });
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchQuery, users, passwordFilter, mfaFilter, creationDateFilter]);

    // Calculate pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        setSelectedUserIds([]); // Clear selection when changing page
    };

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <Loader />
        );
    }

    // Show redirecting state if not admin
    if (status !== 'authenticated' || !user || user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Redirecting...</div>
            </div>
        );
    }

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/user');
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (userData: CreateUserData) => {
        setIsCreating(true);
        try {
            const newUser = await apiFetch('/user', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' },
            });
            setUsers((prev) => [...prev, newUser]);
            setShowCreateForm(false);
            toast.success('User created successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to create user.'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateUser = async (userId: string, userData: Partial<CreateUserData>) => {
        setIsUpdating(true);
        try {
            const updatedUser = await apiFetch(`/user/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' },
            });
            setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)));
            setShowEditForm(false);
            setEditingUser(null);
            toast.success('User updated successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to update user.'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }
        try {
            await apiFetch(`/user/${userId}`, { method: 'DELETE' });
            setUsers((prev) => prev.filter((user) => user.id !== userId));
            toast.success('User deleted successfully!');
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to delete user.'}`);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!confirm("Are you sure you want to reset this user's password?")) {
            return;
        }
        try {
            const data = await apiFetch(`/user/${userId}/reset-password`, {
                method: 'POST',
            });
            toast.success(`Password reset successfully! New password: ${data.newPassword}`);
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to reset password.'}`);
        }
    };

    const handleDeleteUsers = async (userIds: string[]) => {
        if (userIds.length === 0) {
            toast.error('Please select users to delete');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${userIds.length} user(s)?`)) {
            return;
        }

        try {
            // Delete all selected users
            await Promise.all(
                userIds.map((userId) => apiFetch(`/user/${userId}`, { method: 'DELETE' }))
            );
            
            setUsers((prev) => prev.filter((user) => !userIds.includes(user.id)));
            setSelectedUserIds([]);
            toast.success(`Successfully deleted ${userIds.length} user(s)!`);
        } catch (error: any) {
            toast.error(`Error: ${error?.error || 'Failed to delete users.'}`);
        }
    };

    if (showCreateForm) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <CreateUserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => setShowCreateForm(false)}
                    isLoading={isCreating}
                />
            </div>
        );
    }

    if (showEditForm && editingUser) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <EditUserForm
                    user={editingUser}
                    onSubmit={(userData) => handleUpdateUser(editingUser.id, userData)}
                    onCancel={() => {
                        setShowEditForm(false);
                        setEditingUser(null);
                    }}
                    isLoading={isUpdating}
                />
            </div>
        );
    }

    if (showCSVImport) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <CSVImportForm
                    onImportComplete={() => {
                        fetchUsers(); // Refresh user list after import
                        setShowCSVImport(false);
                    }}
                    onClose={() => setShowCSVImport(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#101828] ">
            <div className="m-1">
            <div className="flex flex-row justify-between">
                <h1 className="text-4xl font-bold text-[#101828] dark:text-white">Users</h1>
                {users.length > 0 && (
                    selectedUserIds.length > 0 ? (
                        <div className="flex gap-3">
                            <CustomButton
                                startIcon={<MdDeleteForever className="w-5 h-5" />}
                                name={`Delete Selected (${selectedUserIds.length})`}
                                onClick={() => handleDeleteUsers(selectedUserIds)}
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
                                style="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
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
            <div className="flex flex-row ">

            <Input 
                type="search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-4 p-2 border h-[36px] border-[#333e4f] shadow-sm w-full max-w-sm dark:text-gray-300 dark:bg-[#101828]" 
                placeholder=" Search users..." />


            {/* Password Filter Dropdown */}
            <div className="relative ml-3 mt-5">
                <CustomButton 
                    startIcon={<CiCirclePlus className="w-4 h-4" />}
                    name={passwordFilter === 'all' ? 'Password Reset' : passwordFilter === 'set' ? 'Password: Set' : 'Password: Not Set'}
                    onClick={() => {
                        setShowPasswordDropdown(!showPasswordDropdown);
                        setShowCreationDateDropdown(false);
                        setShowMfaDropdown(false);
                    }}
                    btnType="button"
                    style="border-dashed border-[#333e4f] text-[#99a1af] dark:text-gray-400 h-[28px]"
                />
                {showPasswordDropdown && (
                    <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#1a2332] border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 w-40 p-2">
                        <label className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={passwordFilter === 'all'}
                                onChange={() => {
                                    setPasswordFilter('all');
                                    setShowPasswordDropdown(false);
                                }}
                                className="mr-2 w-4 h-4"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">All</span>
                        </label>
                        <label className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={passwordFilter === 'set'}
                                onChange={() => {
                                    setPasswordFilter('set');
                                    setShowPasswordDropdown(false);
                                }}
                                className="mr-2 w-4 h-4"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Set</span>
                        </label>
                        <label className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={passwordFilter === 'not-set'}
                                onChange={() => {
                                    setPasswordFilter('not-set');
                                    setShowPasswordDropdown(false);
                                }}
                                className="mr-2 w-4 h-4"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Not Set</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Creation Date Filter Dropdown */}
            <div className="relative ml-3 mt-5">
                <CustomButton 
                    name={creationDateFilter === 'all' ? 'Creation date' : creationDateFilter === 'latest' ? 'Date: Latest' : 'Date: Oldest'}
                    startIcon={<CiCirclePlus className="w-4 h-4" />}
                    onClick={() => {
                        setShowCreationDateDropdown(!showCreationDateDropdown);
                        setShowPasswordDropdown(false);
                        setShowMfaDropdown(false);
                    }}
                    btnType="button"
                    style="border-dashed border-[#333e4f] text-[#99a1af] dark:text-gray-400 h-[28px]"
                />
                {showCreationDateDropdown && (
                    <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#1a2332] border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 w-40">
                        <button
                            onClick={() => {
                                setCreationDateFilter('all');
                                setShowCreationDateDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            All
                        </button>
                        <button
                            onClick={() => {
                                setCreationDateFilter('latest');
                                setShowCreationDateDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Latest First
                        </button>
                        <button
                            onClick={() => {
                                setCreationDateFilter('oldest');
                                setShowCreationDateDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Oldest First
                        </button>
                    </div>
                )}
            </div>

            {/* MFA Filter Dropdown */}
            <div className="relative ml-3 mt-5">
                <CustomButton 
                    name={mfaFilter === 'all' ? 'MFA' : mfaFilter === 'yes' ? 'MFA: Yes' : 'MFA: No'}
                    startIcon={<CiCirclePlus className="w-4 h-4" />}
                    onClick={() => {
                        setShowMfaDropdown(!showMfaDropdown);
                        setShowPasswordDropdown(false);
                        setShowCreationDateDropdown(false);
                    }}
                    btnType="button"
                    style="border-dashed border-[#333e4f] text-[#99a1af] dark:text-gray-400 h-[28px]"
                />
                {showMfaDropdown && (
                    <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#1a2332] border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 w-40">
                        <button
                            onClick={() => {
                                setMfaFilter('all');
                                setShowMfaDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            All
                        </button>
                        <button
                            onClick={() => {
                                setMfaFilter('yes');
                                setShowMfaDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => {
                                setMfaFilter('no');
                                setShowMfaDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            No
                        </button>
                    </div>
                )}
            </div>
            </div>
            </div>

            <UserList
                users={currentUsers}
                onCreateUser={() => setShowCreateForm(true)}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onImportCSV={() => setShowCSVImport(true)}
                isLoading={isLoading}
                selectedUserIds={selectedUserIds}
                onSelectionChange={setSelectedUserIds}
            />

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
                <div className="flex justify-between items-center mt-6 px-4 pb-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border ${
                                currentPage === 1
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            Previous
                        </button>
                        
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                // Show first page, last page, current page, and pages around current
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === totalPages ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-3 py-1 rounded border ${
                                                currentPage === pageNumber
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                } else if (
                                    pageNumber === currentPage - 2 ||
                                    pageNumber === currentPage + 2
                                ) {
                                    return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border ${
                                currentPage === totalPages
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;