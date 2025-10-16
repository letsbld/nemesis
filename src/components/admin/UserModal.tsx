'use client';
import { useEffect, useState } from 'react';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { getUserDevices, deletePasskey } from '../user/passkey';
import { EditUserForm } from './EditUserForm'; // ✅ import form component

interface UserModalProps {
  
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onDelete: (userId: string) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onUpdate: (userId: string, data: Partial<CreateUserData>) => Promise<void>; // new prop for update
}

export default function UserModal({
  userId,
  open,
  onClose,
  onDelete,
  onResetPassword,
  onUpdate,
}: UserModalProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch user data when modal opens
  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      setError(null);
      apiFetch(`/user/${userId}`)
        .then((data) => {
          if (!data) throw new Error('Failed to fetch user info');
          setUser(data);
        })
        .catch((err) => setError(err.message || 'Error fetching user'))
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setError(null);
    }
  }, [open, userId]);

  // 🔹 Handle update
  const handleSubmit = async (formData: Partial<CreateUserData>) => {
    if (!userId) return;
    setSubmitting(true);
    try {
      await onUpdate(userId, formData);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 🔹 Handle delete (delete all passkeys for this user, then delete user)
  const handleDeleteUser = async () => {
    if (userId) {
      setSubmitting(true);
      setError(null);
      try {
        // 1. Fetch all passkeys for this user
        const passkeys = await getUserDevices();
        if (Array.isArray(passkeys)) {
          for (const pk of passkeys) {
            if (pk.id) {
              // Delete each passkey by its id
              await deletePasskey(pk.id);
            }
          }
        }
        // 2. Now delete the user
        await onDelete(userId);
        onClose();
      } catch (err: any) {
        setError(err?.error || err?.message || 'Failed to delete user or credentials');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // 🔹 Handle password reset
  const handleResetPassword = async () => {
    if (userId) {
      await onResetPassword(userId);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">{error}</div>
        ) : user ? (
          <div className="p-6">
            {/* ✅ Use EditUserForm */}
            <EditUserForm
              user={user}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isLoading={submitting}
            />

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 border-t pt-4">
              <button
                onClick={handleResetPassword}
                disabled={submitting}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
              >
                Reset Password
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                Delete User
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
