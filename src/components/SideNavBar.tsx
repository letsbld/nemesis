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
    href?: string; // Optional href for the title itself
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

    // Helper function to check if a path is active
    const isActive = (href: string) => {
        if (href.includes('?')) {
            // Handle query parameters
            const basePath = href.split('?')[0];
            return pathname === basePath || pathname.startsWith(basePath + '/');
        }
        return pathname === href || pathname.startsWith(href + '/');
    };

    // Helper function to check if any child link is active
    const hasActiveChild = (links: { href: string; label: string }[]) => {
        return links.some(link => isActive(link.href));
    };

    // Loading or not authenticated
    if (!user) {
        return (
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-500">
                <div className="p-4 text-2xl font-bold">DLP Dashboard</div>
                <div className="p-4 text-gray-400">Please log in</div>
            </nav>
        );
    }

    const isAdmin = user.role == 'admin';
    const isUser = user.role == 'user';

    // Show admin navigation
    if (isAdmin) {
        return (
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-500">
                <h1 className="p-4 text-2xl font-bold">
                    Welcome, {user.display_name || user.username || 'to Admin Panel'}
                </h1>
                
                <SidebarMenu className="flex-1">
                    <ul className="flex flex-col p-4">
                        <li className="mb-2">
                            <Link href="/admin/dashboard" className={`flex items-center hover:underline text-white hover:text-gray-300 ${isActive('/admin/dashboard') ? 'text-green-400' : ''}`}>
                                {isActive('/admin/dashboard') && <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>}
                                Dashboard
                            </Link>
                        </li>
                        <CollapsibleItem
                            title="Device Management"
                            href="/admin/device/overview"
                            links={[
                                 { href: '/admin/device/overview', label: 'Devices' },
                                //{ href: '/admin/device', label: 'All Devices' },
                             { href: '/admin/device/commands', label: 'Commands' },

                                //{ href: '/admin/device/command', label: 'Device Logs' },
                                //{ href: '/admin/device/report', label: 'Device Report' },
                              //  { href: '/admin/device/profile', label: 'Device Profile' },
                            ]}
                            isActive={isActive}
                            hasActiveChild={hasActiveChild}
                        />
                        <CollapsibleItem
                            title="User Management"
                            href="/admin/users"
                            links={[
                                { href: '/admin/users', label: 'Users' },
                                { href: '/admin/user-groups', label: 'User Groups' },
                            ]}
                            isActive={isActive}
                            hasActiveChild={hasActiveChild}
                        />
                        <CollapsibleItem
                            title="SSO & Security"
                            href="/dashboard/sso-management"
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
                            isActive={isActive}
                            hasActiveChild={hasActiveChild}
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

const CollapsibleItem: React.FC<CollapsibleItemProps & { isActive?: (href: string) => boolean; hasActiveChild?: (links: { href: string; label: string }[]) => boolean }> = ({ title, links, href, isActive, hasActiveChild }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleTitleClick = () => {
        // Always toggle the collapsible when title is clicked
        setIsOpen(!isOpen);
    };

    // Check if this item or any of its children are active
    const isItemActive = href && isActive ? isActive(href) : false;
    const hasActiveChildren = hasActiveChild ? hasActiveChild(links) : false;
    const shouldShowActive = isItemActive || hasActiveChildren;

    return (
        <Collapsible defaultOpen={false} className="group/collapsible" onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <button
                    onClick={handleTitleClick}
                    className={`flex justify-between items-center w-full text-white hover:text-gray-300 py-2 ${shouldShowActive ? 'text-green-400' : ''}`}
                >
                    <div className="flex items-center">
                        {shouldShowActive && <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>}
                        {title}
                    </div>
                    <span
                        className={`ml-2 transform transition-transform ${
                            isOpen ? 'rotate-90' : 'rotate-0'
                        }`}
                    >
                        ▶
                    </span>
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <ul className="ml-4 space-y-2">
                    {links.map((link) => {
                        const linkIsActive = isActive ? isActive(link.href) : false;
                        return (
                            <li key={link.href}>
                                <Link href={link.href} className={`flex items-center text-white hover:text-gray-300 ${linkIsActive ? 'text-green-400' : ''}`}>
                                    {linkIsActive && <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>}
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </CollapsibleContent>
        </Collapsible>
    );
};
