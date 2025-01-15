'use client';
import Link from 'next/link';
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarProvider,
    useSidebar,
} from '../ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

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
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>Device</SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <Link href="/device/settings" className="hover:underline">
                                            Device Settings
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/device/logs" className="hover:underline">
                                            Device Logs
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/device/report" className="hover:underline">
                                            Device Report
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/device/profile" className="hover:underline">
                                            Device Profile
                                        </Link>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>User</SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <Link href="/user/settings" className="hover:underline">
                                            User Settings
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/user/logs" className="hover:underline">
                                            User Logs
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/user/report" className="hover:underline">
                                            User Report
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/user/profile" className="hover:underline">
                                            User Profile
                                        </Link>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>Insights</SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <Link href="/insights/settings" className="hover:underline">
                                            Insights Settings
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/insights/logs" className="hover:underline">
                                            Insights Logs
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/insights/report" className="hover:underline">
                                            Insights Report
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <Link href="/insights/profile" className="hover:underline">
                                            Insights Profile
                                        </Link>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </ul>
            </SidebarMenu>
        </nav>
    );
};
