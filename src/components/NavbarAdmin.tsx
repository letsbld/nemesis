'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiSearch, FiBell, FiLogOut } from 'react-icons/fi';

interface NavbarAdminProps {
  activeTab?: string;
}


export const NavbarAdmin = ({ activeTab }: { activeTab?: string }) => {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const pathname = usePathname();

  // Map routes to page titles
  const pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'Users',
    '/admin/user-groups': 'User Groups',
    '/admin/device/overview': 'Devices',
    '/admin/device/commands': 'Commands',
    '/dashboard/sso-management': 'Security',
    '/admin/get-started': 'Get Started',
  };

  // Find the best match for the current path
  const currentTitle = Object.entries(pageTitles).find(([route]) => pathname === route || pathname.startsWith(route + '/'))?.[1] || 'Dashboard';

  return (
    <nav className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-6">
      {/* Left section - Page Title */}
      <div className="text-lg font-semibold text-blue-600 tracking-tight">
        {currentTitle}
      </div>

      {/* Middle - Search bar */}
      <div className="relative flex-1 max-w-md mx-8 hidden md:block">
        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-600 hover:text-blue-600">
          <FiBell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-3 h-3 flex items-center justify-center" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="text-gray-800 text-sm font-medium">{user?.display_name || user?.username}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
