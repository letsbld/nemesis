// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { useSearch } from '@/context/SearchContext';
// import { FiSearch, FiBell, FiLogOut } from 'react-icons/fi';
// import { usePathname } from 'next/navigation';
// import { Navbar } from 'flowbite-react';



// export const NavbarAdmin: React.FC = () => {
//   const { user } = useAuth();
//   const { setSearchQuery } = useSearch();
//   const router = useRouter();
//   const [search, setSearch] = useState('');
//   const pathname = usePathname();
//   const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

//   // Clear search when pathname changes
//   useEffect(() => {
//     setSearch('');
//     setSearchQuery('');
//   }, [pathname, setSearchQuery]);

//   // Debounced search callback
//   useEffect(() => {
//     // Clear previous timeout
//     if (debounceRef.current) {
//       clearTimeout(debounceRef.current);
//     }

//     // Set new timeout
//     debounceRef.current = setTimeout(() => {
//       setSearchQuery(search);
//     }, 300); // 300ms debounce delay

//     // Cleanup
//     return () => {
//       if (debounceRef.current) {
//         clearTimeout(debounceRef.current);
//       }
//     };
//   }, [search, setSearchQuery]);

//   // Logout function
//   const logout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('authUser');
//     router.push('/auth/admin/login');
//   };

//   // Map routes to page titles
//   const pageTitles: { [key: string]: string } = {
//     '/admin/dashboard': 'Dashboard',
//     '/admin/users': 'User Management',
//     '/admin/user-groups': 'User Management',
//     '/admin/device/overview': 'Device Management',
//     '/admin/device/commands': 'Device Management',
//     '/admin/device/logs': 'Device Management',
//     '/admin/device/profile': 'Device Management',
//     '/admin/device/report': 'Device Management',
//     '/dashboard/sso-management': 'Security',
//     '/admin/certificate': ' Security Certificate ',
//   };

//   // Find the best match for the current path
//   const currentTitle = Object.entries(pageTitles).find(([route]) => pathname === route || pathname.startsWith(route + '/'))?.[1] || 'Dashboard';
//   return (
//     <Navbar className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between px-6">
//       {/* Left section - Page Title */}
//       <div className="text-xl font-[600] text-blue-600 dark:text-blue-400 tracking-tight">
//         {currentTitle}
//       </div>

      
//     </Navbar>
//   );
// };
