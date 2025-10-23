// Simple User Navbar
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiLogOut } from 'react-icons/fi';


export const NavbarUser = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="text-xl font-bold text-blue-600">DLP Dashboard</Link>
        <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
              {user?.display_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <button
                onClick={logout}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
                </button>
        </div>
      </div>
    </nav>
  );
}
