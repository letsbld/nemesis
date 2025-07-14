import { withAuth } from 'next-auth/middleware';

export default withAuth({
    callbacks: {
        authorized: ({ token, req }) => {
            // For admin API routes, require admin role
            if (req.nextUrl.pathname.startsWith('/api/admin/')) {
                return token?.role === 'admin';
            }

            // For other protected routes, just require authentication
            return token?.email !== undefined;
        },
    },
});

export const config = {
    matcher: ['/api/admin/:path*'],
};
