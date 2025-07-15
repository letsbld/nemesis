import { withAuth } from 'next-auth/middleware';

export default withAuth({
    callbacks: {
        authorized: ({ token }) => {
            // Just require authentication for protected routes
            // API routes will handle their own authorization
            return token?.email !== undefined;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
});

export const config = {
    // Only protect specific admin and dashboard routes, exclude auth routes
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        // Exclude auth routes and API routes to prevent infinite loops
        '/((?!api|auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
