'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import CustomButton from '@/components/ui/customButton';
import UserModal from './UserModal';
import { Users, Plus } from 'lucide-react';

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <Users className="text-blue-600 w-7 h-7" />
            <h1 className="text-3xl font-bold">User Management</h1>
        </div>
       
        <div className="flex gap-3">
          <CustomButton
            name="Import CSV"
            onClick={onImportCSV}
            btnType="button"
            style="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            loading={isLoading}
          />
          <CustomButton
            name="Create New User"
            onClick={onCreateUser}
            btnType="button"
            style="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            loading={isLoading}
          />
        </div>
      </div>

      {/* No users found */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No users found</p>
          <div className="flex gap-3 justify-center">
            <CustomButton
              name="Import from CSV"
              onClick={onImportCSV}
              btnType="button"
              style="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
            />
            <CustomButton
              name="Create First User"
              onClick={onCreateUser}
              btnType="button"
              style="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            />
          </div>
        </div>
      ) : (
        // ----------------------------
        // User Table
        // ----------------------------
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {/* Checkbox header (optional for select all) */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MFA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:underline text-sm font-medium"
                      onClick={() => openUserModal(user.id)}
                    >
                      {user.first_name} {user.middle_name || ''} {user.last_name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.company_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.password ? 'Set' : 'Not Set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.totp_enabled ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
