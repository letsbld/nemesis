import { withAuth } from 'next-auth/middleware';

export default withAuth({
    callbacks: {
        authorized: ({ token }) => {
            return token?.email !== undefined; // Adjust if you need role checking
        },
    },
});

export const config = {
    matcher: ['/api/admin/:path*'],
};
