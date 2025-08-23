import NextAuth from 'next-auth';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { AppDataSource } from '@/backend/lib/typeorm';
import { User } from '@/backend/domains/user/entities/User.entity';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
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
            },
            async authorize(credentials) {
                console.log('=== NEXTAUTH AUTHORIZE CALLED ===');
                console.log('Received credentials:', {
                    username: credentials?.username,
                    passwordProvided: !!credentials?.password,
                });

                if (!credentials?.username || !credentials?.password) {
                    console.log('Missing username or password');
                    return null;
                }

                try {
                    if (!AppDataSource.isInitialized) {
                        await AppDataSource.initialize();
                    }

                    const userRepository = AppDataSource.getRepository(User);
                    const user = await userRepository.findOne({
                        where: { username: credentials.username },
                    });

                    if (!user) {
                        console.log('User not found:', credentials.username);
                        return null;
                    }

                    console.log('User found:', user.username);

                    const isValidPassword = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isValidPassword) {
                        console.log('Invalid password for user:', credentials.username);
                        return null;
                    }

                    console.log('Password validated successfully');

                    return {
                        id: user.id.toString(),
                        name: user.display_name || user.username,
                        email: user.company_email,
                        role: user.role || 'user',
                        totpEnabled: user.totp_enabled || false,
                    };
                } catch (error: any) {
                    console.error('Authentication error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
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
                token.requiresTotpSetup = (user as any).requiresTotpSetup;
                token.totpEnabled = (user as any).totpEnabled;
            }
            if (account?.provider === 'google') {
                token.role = 'admin';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
                (session.user as any).requiresTotpSetup = token.requiresTotpSetup;
                (session.user as any).totpEnabled = token.totpEnabled;
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
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
