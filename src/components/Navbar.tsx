'use client';

import { useAuth } from '@/context/AuthContext';
import { NavbarAdmin } from './NavbarAdmin';
import { NavbarUser } from './NavbarUser';
import { NavbarPublic } from './NavbarPublic';

interface NavbarProps {
  activeTab?: string; // optional, to avoid errors when not passed
}

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border border-gray-300  z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Logo/Brand */}
                    <Link 
                        href="/"
                        className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700"
                    >
                        <span>Nemesis</span>
                    </Link>

  if (!user) {
    // No one is logged in → show public navbar
    return <NavbarPublic />;
  }

  // Logged in user → show based on role
   if (user.role === 'user') {         
    return <NavbarUser />;
    }
  if (user.role === 'admin') {
    return <NavbarAdmin activeTab={activeTab || ''} />;
  }
   
  }
