'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SquareTerminal,
  LayoutGrid,
  BookUser,
  ChevronsUpDown,
  Inbox
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { PiCertificateBold } from 'react-icons/pi';
import{HiLockClosed} from 'react-icons/hi';
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  SidebarLogo,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Avatar,
  Spinner
} from 'flowbite-react';
import {
  HiChartPie,
  HiClipboardList,
  HiDocumentReport,
  HiCog,
  HiUsers,
  HiShieldCheck,
  HiCloudUpload,
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

const customTheme = {
  root: {
    base: 'h-full',
    inner: 'h-full overflow-y-auto overflow-x-hidden bg-white dark:bg-[#101828] py-4 px-3',
  },
  item: {
    base: 'flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group transition-colors',
    active: 'text-blue-600 dark:text-blue-400',
    icon: {
      base: 'h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400 transition duration-75 group-hover:text-blue-600 dark:group-hover:text-blue-400',
      active: 'text-blue-600 dark:text-blue-400',
    },
  },
};

export const SideNavBarAdmin = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const userdetails = localStorage.getItem('authUser');
  const user = userdetails ? JSON.parse(userdetails) : null;
  const { logout } = useAuth();


  const handleNavigation = (path: string) => {
    if (pathname === path) return;
    setLoadingItem(path);
    router.push(path);
  };

  // Stop spinner once the route changes
  useEffect(() => {
    setLoadingItem(null);
  }, [pathname]);

  

  return (
    <Sidebar
      aria-label="Admin Sidebar"
      theme={customTheme}
      className="fixed left-0 top-0 w-64 h-screen border-r border-[#e5e7eb] dark:border-[#333e4f]"
    >
      <SidebarItems>
        <SidebarItemGroup>
          <div className="flex flex-row items-center mb-1">
            <img src="/nemesis.svg" alt="Company Logo" className="w-[24px] h-[24px] mx-auto mb-2 bg-white rounded-xl" />
            <span className="text-lg font-semibold lowercase text-gray-900 dark:text-white ml-2">
              The Secure Company
            </span>

          </div>
          
        </SidebarItemGroup>

        <SidebarItemGroup>
          {/* General Section */}
          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/dashboard')}
            icon={() =>
              loadingItem === '/admin/dashboard' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiChartPie className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/dashboard' ||
              pathname.startsWith('/admin/dashboard/')
            }
          >
            Dashboard
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/inbox')}
            icon={() =>
              loadingItem === '/admin/inbox' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <Inbox className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/inbox' || pathname.startsWith('/admin/inbox/')
            }
          >
            Inbox
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/filesharing')}
            icon={() =>
              loadingItem === '/filesharing' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiCloudUpload className="h-5 w-5" />
              )
            }
            active={pathname === '/filesharing' || pathname.startsWith('/filesharing/')}
          >
            File Sharing
          </SidebarItem>

          {/* Device Management Section */}
          <div className="px-3 py-2 mt-4 text-sm font-[300] text-[#6a7282] dark:text-gray-400 uppercase tracking-wider">
            Device Management
          </div>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/device/overview')}
            icon={() =>
              loadingItem === '/admin/device/overview' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <LayoutGrid className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/device/overview' ||
              pathname.startsWith('/admin/device/overview/')
            }
          >
            Overview
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/device/commands')}
            icon={() =>
              loadingItem === '/admin/device/commands' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <SquareTerminal className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/device/commands' ||
              pathname.startsWith('/admin/device/commands/')
            }
          >
            Commands
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/device/report')}
            icon={() =>
              loadingItem === '/admin/device/report' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiDocumentReport className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/device/report' ||
              pathname.startsWith('/admin/device/report/')
            }
          >
            Reports
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/device/logs')}
            icon={() =>
              loadingItem === '/admin/device/logs' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiClipboardList className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/device/logs' ||
              pathname.startsWith('/admin/device/logs/')
            }
          >
            Logs
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/device/settings')}
            icon={() =>
              loadingItem === '/admin/device/settings' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiCog className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/device/settings' ||
              pathname.startsWith('/admin/device/settings/')
            }
          >
            Settings
          </SidebarItem>

          {/* User Management Section */}
          <div className="px-3 py-2 mt-4 text-sm font-[300] text-[#6a7282] dark:text-gray-400 uppercase tracking-wider">
            User Management
          </div>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/users')}
            icon={() =>
              loadingItem === '/admin/users' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <BookUser className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/users' ||
              pathname.startsWith('/admin/users/')
            }
          >
            Users
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/user-groups')}
            icon={() =>
              loadingItem === '/admin/user-groups' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiUsers className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/user-groups' ||
              pathname.startsWith('/admin/user-groups/')
            }
          >
            User Groups
          </SidebarItem>
          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/password-manager')}
            icon={() =>
              loadingItem === '/admin/password-manager' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiLockClosed className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/password-manager' ||
              pathname.startsWith('/admin/password-manager/')
            }
          >
            Password Manager
          </SidebarItem>

          {/* Security Section */}
          <div className="px-3 py-2 mt-4 text-sm font-[300] text-[#6a7282] dark:text-gray-400 uppercase tracking-wider">
            Security
          </div>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/sso-management')}
            icon={() =>
              loadingItem === '/admin/sso-management' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <HiShieldCheck className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/sso-management' ||
              pathname.startsWith('/admin/sso-management/')
            }
          >
            SSO Management
          </SidebarItem>

          <SidebarItem
            href="#"
            onClick={() => handleNavigation('/admin/certificate')}
            icon={() =>
              loadingItem === '/admin/certificate' ? (
                <Spinner size="sm" color="info" />
              ) : (
                <PiCertificateBold className="h-5 w-5" />
              )
            }
            active={
              pathname === '/admin/certificate' ||
              pathname.startsWith('/admin/certificate/')
            }
          >
            Security Certificate
          </SidebarItem>
        </SidebarItemGroup>

        <SidebarItemGroup>
          <ThemeToggle />
        </SidebarItemGroup>

        <SidebarItemGroup className="px-3 py-2">
          <Dropdown
            inline
            arrowIcon={false}
            label={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Avatar rounded />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email.slice(0, user?.email.indexOf('@')) || '<Name>'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || '<Email>'}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            }
          >
            <DropdownItem href="#">Profile</DropdownItem>
            <DropdownItem href="#">Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={logout}>Logout</DropdownItem>
          </Dropdown>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};
