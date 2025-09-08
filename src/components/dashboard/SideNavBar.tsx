'use client';
import Link from 'next/link';
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarProvider,
} from '../ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useState } from 'react';
import CustomButton from '../ui/customButton';
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
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
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
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
                <Link href="/room" className="p-4 text-2xl font-bold hover:underline">
                    DLP Dashboard
                </Link>
                <div className="px-4 pb-2 text-sm text-gray-400">
                    Admin: {user.display_name || user.username || 'Admin'}
                </div>
                <SidebarMenu className="flex-1">
                    <ul className="flex flex-col p-4">
                        <li className="mb-2">
                            <Link href="/dashboard" className="hover:underline">
                                Dashboard
                            </Link>
                        </li>
                        <CollapsibleItem
                            title="Device"
                            links={[
                                { href: '/device', label: 'Device Settings' },
                                { href: '/device/logs', label: 'Device Logs' },
                                { href: '/device/report', label: 'Device Report' },
                                { href: '/device/profile', label: 'Device Profile' },
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
                <div className="p-4 border-t border-gray-700">
                    <CustomButton
                        name="Logout"
                        onClick={logout}
                        btnType="button"
                        style="w-full bg-red-600 hover:bg-red-700 text-white"
                    />
                </div>
            </nav>
        );
    }

    // Show user navigation
    if (isUser) {
        return (
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
                <Link href="/room" className="p-4 text-2xl font-bold hover:underline">
                    DLP Dashboard
                </Link>
                <div className="px-4 pb-2 text-sm text-gray-400">
                    Welcome, {user.display_name || user.username || 'User'}
                </div>
                <SidebarMenu className="flex-1">
                    <ul className="flex flex-col p-4">
                        <li className="mb-2">
                            <Link href="/home" className="hover:underline">
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
                            <Link href="/user/list" className="hover:underline">
                                Users
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/user/settings" className="hover:underline">
                                Settings
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/user/totp" className="hover:underline">
                                Two-Factor Auth
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href="/user/passkey" className="hover:underline">
                                Passkey
                            </Link>
                        </li>
                    </ul>
                </SidebarMenu>

                {/* Logout section at the bottom */}
                <div className="p-4 border-t border-gray-700">
                    <CustomButton
                        name="Logout"
                        onClick={logout}
                        btnType="button"
                        style="w-full bg-red-600 hover:bg-red-700 text-white"
                    />
                </div>
            </nav>
        );
    }

    return <>SOme error</>;
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
