import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        // Handle TOTP requirement redirects
        const token = req.nextauth.token;

        // Only redirect to TOTP if we're certain the user needs it
        // This helps avoid redirect loops after TOTP is enabled
        if (token?.role === 'user' && token.requiresTotpSetup === true) {
            // Allow access to TOTP setup page
            if (req.nextUrl.pathname === '/user/totp') {
                return NextResponse.next();
            }

            // Allow API routes to proceed
            if (req.nextUrl.pathname.startsWith('/api/')) {
                return NextResponse.next();
            }

            // Only redirect specific user routes to TOTP setup
            const userRoutes = [
                '/home',
                '/room',
                '/user/profile',
                '/user/settings',
                '/user/report',
            ];
            const needsRedirect = userRoutes.some(
                (route) =>
                    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
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
                // Allow auth routes without authentication
                if (req.nextUrl.pathname.startsWith('/auth')) {
                    return true;
                }

                // Just require authentication for protected routes
                return token?.email !== undefined;
            },
        },
        pages: {
            signIn: '/auth/login',
        },
    }
);

export const config = {
    // Only protect specific admin and dashboard routes, exclude auth routes
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        // Exclude auth routes and API routes to prevent infinite loops
        '/((?!api|auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
