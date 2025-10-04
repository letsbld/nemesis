'use client';
import Link from 'next/link';
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarProvider,
} from './ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useState } from 'react';
import CustomButton from './ui/customButton';
import { useAuth } from '@/context/AuthContext';

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
    const { user, logout } = useAuth();

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
                            <Link href="/admin/dashboard" className="hover:underline">
                                Dashboard
                            </Link>
                        </li>
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
                            title="User Management"
                            links={[
                                { href: '/admin/users', label: 'Users' },
                                { href: '/admin/user-groups', label: 'User Groups' },
                                { href: '/user/settings', label: 'User Settings' },
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

                {/* Logout section at the bottom */}
                {/* <div className="p-4 border-t border-gray-700">
                    <CustomButton
                        name="Logout"
                        onClick={logout}
                        btnType="button"
                        style="w-full bg-red-600 hover:bg-red-700 text-white"
                    />
                </div> */}
            </nav>
        );
    }

    // Show user navigation
    if (isUser) {
        return (
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-500">
                {/* <h1 className=" font-bold ">
                    DLP Dashboard
                </h1> */}
                <div className="p-4 px-4 pb-2">
                    <h1 className="text-lg font-bold text-green-300">
                        Welcome, {user.display_name || user.username || 'User'}
                    </h1>
                </div>

                <SidebarMenu className="flex-1">
                    <ul className="flex flex-col p-4">
                        <li className="mb-2">
                            <Link href="/user/home" className="hover:underline">
                                Home
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/user/profile" className="hover:underline">
                                My Profile
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/user/applications" className="hover:underline">
                                Applications
                            </Link>
                        </li>
                        
                        <li className="mb-2">
                            <Link href="/user/device" className="hover:underline">
                                My Devices
                            </Link>
                        </li>

                        <li className="mb-2">
                            <Link href="/user/passkey" className="hover:underline">
                                Passkey
                            </Link>
                        </li>
                        
                        <li className="mb-2">
                            <Link href="/user/totp" className="hover:underline">
                                Two-Factor Auth
                            </Link>
                        </li>
                        
                    </ul>
                </SidebarMenu>

                {/* Logout section at the bottom */}
                {/* <div className="p-4 border-t border-gray-700">
                    <CustomButton
                        name="Logout"
                        onClick={logout}
                        btnType="button"
                        style="w-full bg-red-600 hover:bg-red-700 text-white"
                    />
                </div> */}
            </nav>
        );
    }

    return <>Some error</>;
};

const CollapsibleItem: React.FC<CollapsibleItemProps> = ({ title, links }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible defaultOpen={false} className="group/collapsible" onOpenChange={setIsOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex justify-between w-full"
                    >
                        {title}
                        <span
                            className={`ml-2 transform transition-transform ${
                                isOpen ? 'rotate-90' : 'rotate-0'
                            }`}
                        >
                            ▶
                        </span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {links.map((link) => (
                            <SidebarMenuSubItem key={link.href}>
                                <Link href={link.href} className="hover:underline">
                                    {link.label}
                                </Link>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
};
