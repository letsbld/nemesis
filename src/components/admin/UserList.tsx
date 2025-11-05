'use client';

import { useState } from 'react'; 
import { useRouter } from 'next/navigation';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import CustomButton from '@/components/ui/customButton';
import UserModal from './UserModal';
import { ChevronsUpDown } from 'lucide-react';
import { CirclePlus } from 'lucide-react';


interface UserListProps {
  users: UserData[];
  onCreateUser: () => void;
  onDeleteUser: (userId: string) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onImportCSV: () => void;
  isLoading?: boolean;
}

export function UserList({
  users,
  onCreateUser,
  onDeleteUser,
  onResetPassword,
  onImportCSV,
  isLoading = false,
}: UserListProps) {
  const router = useRouter();

  // ----------------------------
  // Modal state
  // ----------------------------
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openUserModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUserId(null);
    setIsModalOpen(false);
  };

  // ----------------------------
  // Checkbox selection (optional feature)
  // ----------------------------
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const handleCheckboxChange = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // ----------------------------
  // Update user handler
  // ----------------------------
  const handleUpdateUser = async (id: string, data: Partial<CreateUserData>) => {
    try {
      const res = await apiFetch(`/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res && res.id){
        alert('User updated successfully');
        router.refresh();
      }else{ throw new Error('Failed to update user');

      }
       // ✅ Refresh page or data (if using Next.js dynamic route)
    } catch (error) {
      console.error(error);
      alert('Failed to update user');
    }
  };

  return (
    <div className="pr-2 pl-2">
        <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow dark:shadow-lg overflow-hidden mt-4 border border-transparent dark:border-gray-700">
          <table className="min-w-full">
            <thead className="bg-[#f9fafb] dark:bg-[#101828] h-[44px]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {/* Checkbox header (optional for select all) */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span className="flex flex-row">Creation Date <ChevronsUpDown className="w-5 h-5 text-gray-500 dark:text-gray-400" /></span>
                  
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  MFA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white dark:bg-[#1a2332] divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-gray-500 dark:text-gray-400 text-lg"
                >
                  <p className="mb-6">No users found</p>
                  <div className="flex justify-center gap-4">
                    <CustomButton
                      startIcon={<CirclePlus className="w-4 h-4" />}
                      name="Import CSV"
                      onClick={onImportCSV}
                      btnType="button"
                      style="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                      loading={isLoading}
                    />
                    <CustomButton
                      startIcon={<CirclePlus className="w-4 h-4" />}
                      name="New User"
                      onClick={onCreateUser}
                      btnType="button"
                      style="bg-[#1447E6] hover:bg-blue-700 text-md font-[300] text-white px-4 py-2"
                      loading={isLoading}
                    />
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#101828]">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                      onClick={() => openUserModal(user.id)}
                    >
                      {user.first_name} {user.middle_name || ''} {user.last_name}
                    </button>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.company_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.password ? 'Set' : 'Not Set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.totp_enabled ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(
                              selectedUserId === user.id ? null : user.id
                            );
                          }}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                            />
                          </svg>
                        </button>


                      {selectedUserId === user.id && (
                        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                openUserModal(user.id);
                                setSelectedUserId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onResetPassword(user.id);
                                setSelectedUserId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Reset TOTP
                            </button>
                            <button
                              onClick={() => {
                                onDeleteUser(user.id);
                                setSelectedUserId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
    

      {/* ----------------------------
          User Modal
      ---------------------------- */}
        <UserModal
          userId={selectedUserId}
          open={isModalOpen}
          onClose={closeUserModal}
          onDelete={onDeleteUser}
          onResetPassword={onResetPassword}
          onUpdate={handleUpdateUser}
        />
    </div>
  );
}
