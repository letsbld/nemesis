import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AuthProvider } from '@/context/AuthContext';
import { LayoutContent } from './LayoutContent';
import { ThemeInit } from '../../.flowbite-react/init'; // ✅ Flowbite config initializer

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="DLP" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>

      <body
        className={`${poppins.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* ✅ Add Flowbite ThemeInit at root level */}
        <ThemeInit />

        <AuthProvider>
          <Providers>
            <LayoutContent>{children}</LayoutContent>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
