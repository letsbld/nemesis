'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarProvider } from './ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaCogs, FaKey, FaLaptop, FaFolderOpen } from "react-icons/fa";


interface CollapsibleItemProps {
    title: string;
    links: { href: string; label: string }[];
}

export const SideNavBar = () => {
    return (
        <SidebarProvider>
            <NavBarContent />
        </SidebarProvider>
    );
};

const NavBarContent = () => {
    const { user } = useAuth();
    const pathname = usePathname();

    // // Loading or not authenticated
    // if (!user) {
    //     return (
    //         <nav className="w-64 h-screen text-white flex flex-col bg-gray-500">
    //             <div className="p-4 text-2xl font-bold">DLP Dashboard</div>
    //             <div className="p-4 text-gray-400">Please log in</div>
    //         </nav>
    //     );
    // }

    const isAdmin = user.role == 'admin';
    const isUser = user.role == 'user';

    // Show admin navigation
    if (isAdmin) {
        return (
            <nav className="w-64 h-screen text-white flex flex-col bg-[#0f334b]">
                <h1 className="p-4 text-2xl font-bold">
                    Welcome, {user.display_name || user.username || 'to Admin Panel'}
                </h1>
                
                <SidebarMenu className="flex-1">
                    <ul className="flex flex-col p-4">
                        <li className="mb-2">
                            <Link href="/admin/dashboard" className="hover:underline text-white hover:text-gray-300">
                                Dashboard
                            </Link>
                        </li>
                         <CollapsibleItem
                            title="User Management"
                            links={[
                                { href: '/admin/users', label: 'Users' },
                                { href: '/admin/user-groups', label: 'User Groups' },
                                { href: '/user/settings', label: 'User Settings' },
                            ]}
                        />
                        <CollapsibleItem
                            title="Device"
                            links={[
                                { href: '/admin/device', label: 'Device Settings' },
                                { href: '/admin/device/logs', label: 'Device Logs' },
                                { href: '/admin/device/report', label: 'Device Report' },
                                { href: '/admin/device/profile', label: 'Device Profile' },
                            ]}
                        />
                       
                        <CollapsibleItem
                            title="SSO & Security"
                            links={[
                                { href: '/dashboard/sso-management', label: 'SSO Management' },
                                {
                                    href: '/dashboard/sso-management?tab=policies',
                                    label: 'DLP Policies',
                                },
                                {
                                    href: '/dashboard/sso-management?tab=audit',
                                    label: 'Access Audit',
                                },
                            ]}
                        />
                    </ul>
                </SidebarMenu>

                {/* logo at the bottom */}
                <div className="p-4 text-center text-sm">
                    <p className="text-xs text-white">
                        powered by <span className="text-base font-semibold text-gray-300">DLP Dashboard</span>
                    </p>
                </div>
            </nav>
        );
    }

    // Show user navigation
    if (isUser) {
        return (
            <nav className="w-64 h-screen text-black flex flex-col bg-white  border border-gray-300 shadow-lg">
                {/* <h1 className=" font-bold ">
                    DLP Dashboard
                </h1> */}
                <div className="p-4 px-4 pb-2">
                    <h1 className="text-lg  text-green-600 font-bold">
                        Welcome, {user.display_name || user.username || 'User'}
                    </h1>
                </div>

                <SidebarMenu className="flex-1">

                    <ul className="flex flex-col p-4 space-y-2">
                        <li>
                            <Link 
                                href="/user/applications" 
                                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${pathname === '/user/applications' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            <FaFolderOpen className="text-lg" />
                            <span>Applications</span>
                            </Link>
                        </li>

                        <li>
                            <Link 
                                href="/user/profile" 
                                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${pathname === '/user/profile' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            <FaUser className="text-lg" />
                            <span>My Profile</span>
                            </Link>
                        </li>

                        <li>
                            <Link 
                                href="/user/device" 
                                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${pathname === '/user/device' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            <FaLaptop className="text-lg" />
                            <span>My Devices</span>
                            </Link>
                        </li>

                        <li>
                            <Link 
                                href="/user/passkey" 
                                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${pathname === '/user/passkey' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            <FaKey className="text-lg" />
                            <span>Passkey</span>
                            </Link>
                        </li>

                        <li>
                            <Link 
                                href="/user/settings" 
                                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${pathname === '/user/settings' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            <FaCogs className="text-lg" />
                            <span>Settings</span>
                            </Link>
                        </li>
                    </ul>

                </SidebarMenu>

                {/* logo at the bottom */}
                <div className="p-4 text-center text-sm text-gray-500 ">
                    <p className="text-xs text-gray-500">
                        powered by <span className="text-base font-semibold text-gray-800">DLP Dashboard</span>
                    </p>
                </div>

            </nav>
        );
    }

    return <>Some error</>;
};

const CollapsibleItem: React.FC<CollapsibleItemProps> = ({ title, links }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible
            defaultOpen={false}
            className="group/collapsible"
            onOpenChange={setIsOpen}
            >
            <CollapsibleTrigger asChild>
                <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between w-full items-center text-white hover:text-gray-300 py-2 relative"
                >
                {/* Title and Arrow */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold transition-all duration-200">
                    {isOpen ? '⌄' : '›'}
                    </span>
                    <span>{title}</span>
                </div>

                {/* Divider line below trigger */}
                <span
                    className={`absolute bottom-0 left-0 h-[1px] bg-gray-600 transition-all duration-300 ${
                    isOpen ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                />
                </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <ul className="ml-6 mt-2 space-y-2 border-l border-gray-600 pl-3">
                {links.map((link) => (
                    <li key={link.href}>
                    <Link
                        href={link.href}
                        className="text-white hover:text-gray-300 transition-colors"
                    >
                        {link.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </CollapsibleContent>
        </Collapsible>

    );
};
