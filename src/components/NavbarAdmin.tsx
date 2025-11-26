'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const NavbarAdmin: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/admin/login');
  };

  return (
    <nav className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between px-6">
      <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
        Admin Dashboard
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
