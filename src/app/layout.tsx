import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { SideNavBar } from '@/components/dashboard/SideNavBar';
import { Providers } from './providers';
import { AuthProvider } from '@/context/AuthContext';
// import { useAuth } from '@/context/AuthContext';

const poppins = Poppins({
    weight: ['400', '700'],
    variable: '--font-poppins',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Data Loss Prevention Dashboard',
    description:
        'A comprehensive dashboard to monitor and prevent data loss within your organization.',
    keywords: 'DLP, Data Loss Prevention, Security, Dashboard',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <meta name="apple-mobile-web-app-title" content="DLP" />
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>
                    <Providers>
                        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                            <div className="w-full flex-none md:w-64">
                                <SideNavBar />
                            </div>
                            <div className="flex-grow md:overflow-y-auto">{children}</div>
                        </div>
                    </Providers>
                </AuthProvider>
            </body>
        </html>
    );
}
