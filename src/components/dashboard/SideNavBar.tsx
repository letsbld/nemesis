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
    return (
        <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
            <Link href="/" className="p-4 text-2xl font-bold hover:underline">
                {' '}
                {/* Wrap with Link */}
                DLP Dashboard
            </Link>{' '}
            <SidebarMenu>
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
                            { href: '/user/settings', label: 'User Settings' },
                            { href: '/user/logs', label: 'User Logs' },
                            { href: '/user/report', label: 'User Report' },
                            { href: '/user/profile', label: 'User Profile' },
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
