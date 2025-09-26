'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usePathname } from 'next/navigation';
import { SideNavBar } from '@/components/SideNavBar';

// These paths will show the sidebar
const PROTECTED_PATHS = [
    '/dashboard',
    '/home',
    '/admin',
    '/device',
    '/user',
    '/room'
];

export function LayoutContent({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isProtectedRoute = PROTECTED_PATHS.some(path => pathname?.startsWith(path));

    return (
        <>
            <Navbar />
            <main className="flex-grow pt-16">
                {isProtectedRoute ? (
                    <div className="flex flex-col md:flex-row md:overflow-hidden">
                        <div className="w-full flex-none md:w-64">
                            <SideNavBar />
                        </div>
                        <div className="flex-grow p-6">
                            {children}
                        </div>
                    </div>
                ) : (
                    <div>
                        {children}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
