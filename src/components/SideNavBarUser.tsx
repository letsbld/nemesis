// JumpCloud-style User Sidebar
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUser, FaKey, FaLaptop, FaFolderOpen } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export const SideNavBarUser = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="hidden md:flex fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex-col z-30">
      {/* <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
            {user?.display_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user?.display_name || user?.username}</div>
            <div className="text-sm text-gray-500">User Portal</div>
          </div>
        </div>
      </div> */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <Link href="/user/applications" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/user/applications') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FaFolderOpen className="w-5 h-5" /> <span>Applications</span>
          </Link>
          <Link href="/user/device" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/user/device') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FaLaptop className="w-5 h-5" /> <span>Devices</span>
          </Link>
          <Link href="/user/profile" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/user/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FaUser className="w-5 h-5" /> <span>Profile</span>
          </Link>
          <Link href="/user/password-manager" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/user/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FaUser className="w-5 h-5" /> <span>Password Manager</span>
          </Link>
          <Link href="/user/passkey" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/user/passkey') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FaKey className="w-5 h-5" /> <span>Security Keys</span>
          </Link>
        </div>
      </div>
      <div className="p-4 mt-auto border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">© 2025 DLP Security</div>
      </div>
    </nav>
  );
}
