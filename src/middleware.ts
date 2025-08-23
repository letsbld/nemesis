import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;

        // Skip middleware for auth routes
        if (pathname.startsWith('/auth')) {
            return NextResponse.next();
        }

        // Check for admin routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
            if (token?.role !== 'admin') {
                return NextResponse.redirect(new URL('/auth/login', req.url));
            }
        }

        // Handle TOTP requirement for users only
        if (token?.role === 'user' && token.requiresTotpSetup === true) {
            if (pathname === '/user/totp') {
                return NextResponse.next();
            }

            if (pathname.startsWith('/api/')) {
                return NextResponse.next();
            }

            const userRoutes = [
                '/home',
                '/room',
                '/user/profile',
                '/user/settings',
                '/user/report',
            ];
            const needsRedirect = userRoutes.some(
                (route) => pathname === route || pathname.startsWith(route + '/')
            );

            if (needsRedirect) {
                const url = req.nextUrl.clone();
                url.pathname = '/user/totp';
                url.searchParams.set('required', 'true');
                return NextResponse.redirect(url);
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname;

                // Always allow auth routes
                if (pathname.startsWith('/auth')) {
                    return true;
                }

                // Require authentication for protected routes
                return !!token?.email;
            },
        },
        pages: {
            signIn: '/auth/login',
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/home/:path*', '/user/:path*', '/room/:path*'],
};
