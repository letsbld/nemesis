'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Logo/Brand */}
                    <Link 
                        href="/"
                        className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700"
                    >
                        <span>DLP Dashboard</span>
                    </Link>

                    {/* Right side - Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            About Us
                        </Link>
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Services
                        </Link>
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Contact Us
                        </Link>
                        {user ? (
                            <button
                                onClick={logout}
                                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/auth/user/login"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
