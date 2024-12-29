import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { SideNavBar } from '@/components/dashboard/SideNavBar';

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
            <body className={`${poppins.variable} antialiased`}>
                <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                    <Toaster />
                    <div className="w-full flex-none md:w-64">
                        <SideNavBar />
                    </div>
                    <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
                </div>
            </body>
        </html>
    );
}