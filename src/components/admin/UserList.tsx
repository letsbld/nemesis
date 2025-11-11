'use client';

import { useState, useRef, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import CustomButton from '@/components/ui/customButton';
import { ChevronsUpDown } from 'lucide-react';
import { CirclePlus,FileUp } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import {EditUserForm} from './EditUserForm';



interface UserListProps {
  users: UserData[];
  onCreateUser: () => void;
  onDeleteUser: (userId: string) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onImportCSV: () => void;
  isLoading?: boolean;
  selectedUserIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCreationDateSort?: () => void;
  creationDateSortOrder?: 'latest' | 'oldest';
}

export function UserList({
  users,
  onCreateUser,
  onDeleteUser,
  onCreationDateSort,
  creationDateSortOrder,
  onResetPassword,
  onImportCSV,
  isLoading = false,
  selectedUserIds,
  onSelectionChange,
}: UserListProps) {
  const router = useRouter();

 
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: 'top' | 'bottom' }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // ----------------------------
  // Checkbox selection
  // ----------------------------
  const handleCheckboxChange = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map(u => u.id));
    }
  };

  // ----------------------------
  // Update user handler
  // ----------------------------
  const handleUpdateUser = async (data: Partial<CreateUserData>) => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    try {
      const res = await apiFetch(`/user/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res && res.id){
        alert('User updated successfully');
        setEditingUser(null);
        router.refresh();
      } else { 
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };
  if(isLoading){
    return (
      <div className="flex justify-center items-center h-64">
         <Loader />
      </div>
    );
  }

  return (
    <div className="pr-2 pl-2">
        <div className="bg-white dark:bg-[#1a2332] rounded-lg shadow dark:shadow-lg overflow-hidden mt-4 border border-transparent dark:border-gray-700 overflow-x-auto">
          <table className="min-w-full ">
            <thead className="bg-[#f9fafb] dark:bg-[#101828] h-[44px]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUserIds.length === users.length}
                    onChange={handleSelectAll}
                    className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                  />
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
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={onCreationDateSort}
                >
                  <span className="flex flex-row items-center gap-1">
                    Creation Date 
                    <ChevronsUpDown className={`w-4 h-4 transition-transform ${creationDateSortOrder === 'oldest' ? 'rotate-180' : ''}`} />
                  </span>
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
                      startIcon={<FileUp className="w-4 h-4" />}
                      name="Import CSV"
                      onClick={onImportCSV}
                      btnType="button"
                      style="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2"
                    />
                    <CustomButton
                      startIcon={<CirclePlus className="w-4 h-4" />}
                      name="New User"
                      onClick={onCreateUser}
                      btnType="button"
                      style="bg-[#1447E6] hover:bg-blue-700 text-md font-[300] text-white px-4 py-2"
                    />
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#101828]">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#101828] dark:text-gray-200">
                   
                      {user.first_name} {user.middle_name || ''} {user.last_name}
                    
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.company_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.password ? 'Set' : 'Not Set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short', 
                              year: 'numeric'
                            })
                          : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {user.totp_enabled ? <span className="p-1 bg-[#ECFDF5] rounded border-[1px] border-[#A4F4CF] text-xs text-[#006045]">Yes</span> : <span className="p-1 bg-[#FEF3F2] rounded border-[1px] border-[#FCA5A5] text-xs text-[#991B1B]">No</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <div className="relative inline-block text-left">
                        <button
                          ref={(el) => {
                            buttonRefs.current[user.id] = el;
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            
                            // Calculate if dropdown should open upward
                            const button = buttonRefs.current[user.id];
                            if (button) {
                              const rect = button.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              const dropdownHeight = 150; // Approximate height of dropdown
                              
                              setDropdownPosition({
                                ...dropdownPosition,
                                [user.id]: spaceBelow < dropdownHeight ? 'top' : 'bottom'
                              });
                            }
                            
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
                        <div className={`absolute right-0 z-10 ${dropdownPosition[user.id] === 'top' ? 'bottom-full mb-2' : 'mt-2'} w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setEditingUser(user);
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
          Edit User Form
      ---------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditUserForm
              user={editingUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
              isLoading={isUpdating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
