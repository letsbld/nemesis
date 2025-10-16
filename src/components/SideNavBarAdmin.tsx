'use client';
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTachometerAlt,
  FaUsers,
  FaMicrochip,
  FaUserShield,
  FaKey,
  FaChevronDown,
  FaChevronRight,
} from 'react-icons/fa';

export const SideNavBarAdmin = () => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const [open, setOpen] = useState({ device: true, user: true, security: false });

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-[#1B2A4E] text-gray-200 flex flex-col border-r border-gray-700">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-700">
        <h1 className="text-lg font-semibold tracking-wide text-white">Admin Console</h1>
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              href="/admin/dashboard"
              className={`flex items-center px-5 py-2.5 text-sm rounded-md ${
                isActive('/admin/dashboard')
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-[#2C3E6E] hover:text-white'
              }`}
            >
              <FaTachometerAlt className="w-4 h-4 mr-3" /> Dashboard
            </Link>
          </li>

          {/* Device Management */}
          <li>
            <button
              onClick={() => setOpen(o => ({ ...o, device: !o.device }))}
              className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium hover:bg-[#2C3E6E] hover:text-white focus:outline-none"
            >
              <span className="flex items-center">
                {open.device ? <FaChevronDown className="w-3 h-3 mr-2" /> : <FaChevronRight className="w-3 h-3 mr-2" />}
                Device Management
              </span>
            </button>
            {open.device && (
              <ul className="ml-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/device/overview"
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActive('/admin/device/overview')
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[#2C3E6E]'
                    }`}
                  >
                    <FaMicrochip className="w-4 h-4 mr-2" /> Devices Overview
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/device/commands"
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActive('/admin/device/commands')
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[#2C3E6E]'
                    }`}
                  >
                    <FaKey className="w-4 h-4 mr-2" /> Device Commands
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* User Management */}
          <li>
            <button
              onClick={() => setOpen(o => ({ ...o, user: !o.user }))}
              className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium hover:bg-[#2C3E6E] hover:text-white focus:outline-none"
            >
              <span className="flex items-center">
                {open.user ? <FaChevronDown className="w-3 h-3 mr-2" /> : <FaChevronRight className="w-3 h-3 mr-2" />}
                User Management
              </span>
            </button>
            {open.user && (
              <ul className="ml-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/users"
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActive('/admin/users')
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[#2C3E6E]'
                    }`}
                  >
                    <FaUsers className="w-4 h-4 mr-2" /> Users
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/user-groups"
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActive('/admin/user-groups')
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[#2C3E6E]'
                    }`}
                  >
                    <FaUserShield className="w-4 h-4 mr-2" /> User Groups
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Security */}
          <li>
            <button
              onClick={() => setOpen(o => ({ ...o, security: !o.security }))}
              className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium hover:bg-[#2C3E6E] hover:text-white focus:outline-none"
            >
              <span className="flex items-center">
                {open.security ? <FaChevronDown className="w-3 h-3 mr-2" /> : <FaChevronRight className="w-3 h-3 mr-2" />}
                Security
              </span>
            </button>
            {open.security && (
              <ul className="ml-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/sso-management"
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActive('/dashboard/sso-management')
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[#2C3E6E]'
                    }`}
                  >
                    <FaKey className="w-4 h-4 mr-2" /> SSO Management
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Footer section */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        © {new Date().getFullYear()} Admin Console
      </div>
    </nav>
  );
};
