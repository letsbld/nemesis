'use client';

import { SideNavBar } from '@/components/SideNavBar';
import { usePathname } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { SearchProvider } from '@/context/SearchContext';

const PROTECTED_PATHS = ['/admin', '/user', '/filesharing'];

export function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isProtectedRoute = PROTECTED_PATHS.some(path => pathname?.startsWith(path));

  return (
    <SearchProvider>
      {isProtectedRoute ? (
        <>
          <SideNavBar />
          <div className="min-h-screen bg-white dark:bg-[#101828] flex flex-col md:ml-64">
          <Navbar />
          {pathname?.startsWith("/admin") ? (
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          ) : (
            <main className="flex-1 p-6 mt-16 overflow-y-auto">{children}</main>
          )}
        </div>

        </>
      ) : (
        <>
          <Navbar />
          <main className="flex-grow pt-16 bg-white dark:bg-[#101828]">{children}</main>
          <Footer />
        </>
      )}
    </SearchProvider>
  );
}
