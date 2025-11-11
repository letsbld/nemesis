// JumpCloud-style User Sidebar
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUser, FaKey, FaLaptop, FaFolderOpen, FaCertificate } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { PiCertificateBold } from "react-icons/pi";


export const SideNavBarUser = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="hidden md:flex fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col z-30">
      
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <Link href="/user/applications" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/user/applications') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}>
            <FaFolderOpen className="w-5 h-5" /> <span>Applications</span>
          </Link>
          <Link href="/user/device" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/user/device') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}>
            <FaLaptop className="w-5 h-5" /> <span>Devices</span>
          </Link>
          <Link href="/user/profile" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/user/profile') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}>
            <FaUser className="w-5 h-5" /> <span>Profile</span>
          </Link>
          <Link href="/user/password-manager" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/user/password-manager') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}>
            <FaLockOpen className="w-5 h-5" /> <span>Password Manager</span>
          </Link>
          <Link href="/user/passkey" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/user/passkey') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}>
            <FaKey className="w-5 h-5" /> <span>Security Keys</span>
          </Link>
          <Link href="/user/certificate" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/user/certificate') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}>
            <PiCertificateBold className="w-5 h-5" /> <span>Security Certificate</span>
          </Link>
        </div>
      </div>
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">© 2025 DLP Security</div>
      </div>
    </nav>
  );
}
