// Public Navbar (for not logged in users)
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export const NavbarPublic = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change or click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isMenuOpen && !(e.target as Element).closest('nav')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700">
            <span>DLP Dashboard</span>
          </Link>

          {/* Hamburger for mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {!isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/products" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Products</Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About Us</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact Us</Link>
            <Link href="/auth/user/login" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">Login</Link>
          </div>
        </div>
        {/* Mobile Nav */}
        <div className={`md:hidden transition-all duration-200 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
            <Link href="/auth/user/login" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-4" onClick={() => setIsMenuOpen(false)}>Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
