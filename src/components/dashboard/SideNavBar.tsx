'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
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
    const { data: session, status } = useSession();

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
                <div className="p-4 text-2xl font-bold">DLP Dashboard</div>
                <div className="p-4 text-gray-400">Loading...</div>
            </nav>
        );
    }

    // Type guard to check if user has admin role
    const isAdmin = session?.user && 'role' in session.user && session.user.role === 'admin';

    // Show login prompt if not authenticated or not admin
    if (!session || !isAdmin) {
        return (
            <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
                <div className="p-4 text-2xl font-bold">DLP Dashboard</div>
                <div className="p-4">
                    <p className="text-gray-400 mb-4">Admin access required</p>
                    <Link
                        href="/auth/google/login"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white inline-block"
                    >
                        Login as Admin
                    </Link>
                </div>
            </nav>
        );
    }

    // Show full navigation for authenticated admin users
    return (
        <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
            <Link href="/" className="p-4 text-2xl font-bold hover:underline">
                DLP Dashboard
            </Link>
            <div className="px-4 pb-2 text-sm text-gray-400">
                Welcome, {session.user?.name || session.user?.email || 'Admin'}
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
                            { href: '/device/settings', label: 'Device Settings' },
                            { href: '/device/logs', label: 'Device Logs' },
                            { href: '/device/report', label: 'Device Report' },
                            { href: '/device/profile', label: 'Device Profile' },
                        ]}
                    />
                    <CollapsibleItem
                        title="User"
                        links={[
                            { href: '/user', label: 'User' },
                            { href: '/user/group', label: 'User Group' },
                            { href: '/user/settings', label: 'User Settings' },
                            // { href: '/user/logs', label: 'User Logs' },
                            // { href: '/user/report', label: 'User Report' },
                            // { href: '/user/profile', label: 'User Profile' },
                        ]}
                    />
                    <CollapsibleItem
                        title="Insights"
                        links={[
                            { href: '/insights/settings', label: 'Insights Settings' },
                            { href: '/insights/logs', label: 'Insights Logs' },
                            { href: '/insights/report', label: 'Insights Report' },
                            { href: '/insights/profile', label: 'Insights Profile' },
                        ]}
                    />
                </ul>
            </SidebarMenu>

            {/* Logout section at the bottom */}
            <div className="p-4 border-t border-gray-700">
                <CustomButton
                    name="Logout"
                    onClick={() => signOut({ callbackUrl: '/auth/google/login' })}
                    btnType="button"
                    style="w-full bg-red-600 hover:bg-red-700 text-white"
                />
            </div>
        </nav>
    );
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
