import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
                totpToken: { label: 'TOTP Token', type: 'text' },
            },
            async authorize(credentials) {
                // In production, validate against your database
                // This is where you'd implement your actual authentication logic
                // For now, keeping basic validation for testing

                if (credentials?.username && credentials?.password) {
                    // Replace with your actual authentication logic
                    // This should validate against your user database

                    // Example validation (replace with real implementation)
                    if (credentials.username === 'admin' && credentials.password === 'admin') {
                        return {
                            id: '1',
                            name: 'Admin User',
                            email: 'admin@example.com',
                            role: 'admin',
                        };
                    }

                    if (credentials.username === 'user' && credentials.password === 'user') {
                        return {
                            id: '2',
                            name: 'Regular User',
                            email: 'user@example.com',
                            role: 'user',
                        };
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                // Handle Google sign-in for admins
                // You might want to check if the email is in your admin list
                const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
                if (adminEmails.includes(user.email || '')) {
                    (user as any).role = 'admin';
                    return true;
                }
                return false; // Reject non-admin Google logins
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.role = (user as any).role;
            }
            if (account?.provider === 'google') {
                token.role = 'admin'; // Google logins are admin
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
