import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AuthProvider } from '@/context/AuthContext';
import { LayoutContent } from './LayoutContent';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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
      <body
        className={`${poppins.className} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Providers>
            <LayoutContent>{children}</LayoutContent>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}