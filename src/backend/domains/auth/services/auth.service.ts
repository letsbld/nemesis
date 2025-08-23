import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AppDataSource } from '../../../shared/database/typeorm';
import { Admin } from '../entities/Admin.entity';
import { UserService } from '../../user/services/user.service';
import { TOTPService } from './totp.service';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: [
                        'openid',
                        'email',
                        'profile',
                        'https://www.googleapis.com/auth/admin.directory.user.readonly',
                        'https://www.googleapis.com/auth/admin.directory.user',
                    ].join(' '),
                },
            },
        }),
        CredentialsProvider({
            id: 'credentials',
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
                totpToken: { label: 'TOTP Token', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize();
                }

                const userService = new UserService();
                const user = await userService.validateUserPassword(
                    credentials.username,
                    credentials.password
                );

                if (!user) {
                    return null;
                }

                // Check if TOTP is enabled for this user
                if (user.totp_enabled && user.totp_secret) {
                    if (!credentials.totpToken) {
                        throw new Error('TOTP_REQUIRED');
                    }

                    const isValidTOTP = TOTPService.verifyTOTP(
                        credentials.totpToken,
                        user.totp_secret
                    );

                    if (!isValidTOTP) {
                        throw new Error('INVALID_TOTP');
                    }
                }

                return {
                    id: user.id,
                    email: user.company_email,
                    name: user.display_name,
                    username: user.username,
                    role: 'user',
                    totpEnabled: user.totp_enabled || false,
                    requiresTotpSetup: !user.totp_enabled,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }: any) {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            // Handle Google OAuth (Admin login)
            if (account?.provider === 'google') {
                const adminRepo = AppDataSource.getRepository(Admin);
                const admin = await adminRepo.findOne({ where: { email: user.email } });

                if (admin) {
                    // User is an admin, update their info and tokens
                    admin.display_name = user.name;
                    admin.avatar_url = user.image;
                    admin.access_token = account.access_token;
                    admin.refresh_token = account.refresh_token;
                    admin.token_expires_at = account.expires_at
                        ? new Date(account.expires_at * 1000)
                        : null;
                    await adminRepo.save(admin);
                    return true;
                }

                // Not an admin, deny Google login
                return false;
            }

            // Handle credentials (User login)
            if (account?.provider === 'credentials') {
                // User validation is already done in the authorize function
                return true;
            }

            return false;
        },

        async session({ session, token }: any) {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            // Check if this is a Google OAuth session (admin)
            if (token.provider === 'google' || (!token.provider && session.user.email)) {
                const adminRepo = AppDataSource.getRepository(Admin);
                const admin = await adminRepo.findOne({ where: { email: session.user.email } });

                if (admin) {
                    const adminSession = {
                        ...session,
                        user: {
                            ...session.user,
                            role: 'admin',
                            id: admin.id,
                            displayName: admin.display_name,
                        },
                        accessToken: token.accessToken,
                    };
                    return adminSession;
                }
            }

            // Handle user sessions
            if (token.role === 'user') {
                // ...existing user logic...
                console.log('User session created:', token.role);
            }

            return session;
        },

        async jwt({ token, user, account, trigger }: any) {
            if (account && user) {
                token.provider = account.provider;

                // Store access token for Google OAuth (admin)
                if (account.provider === 'google') {
                    token.accessToken = account.access_token;
                    token.refreshToken = account.refresh_token;
                    token.expiresAt = account.expires_at;
                }

                if (user.role) {
                    token.role = user.role;
                }
                if (user.username) {
                    token.username = user.username;
                }
                if (user.totpEnabled !== undefined) {
                    token.totpEnabled = user.totpEnabled;
                }
                if (user.requiresTotpSetup !== undefined) {
                    token.requiresTotpSetup = user.requiresTotpSetup;
                }
            }

            // Handle session updates (when update() is called)
            if (trigger === 'update' && token.role === 'user') {
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize();
                }

                // Refresh user data for session updates
                const userService = new UserService();
                const userData = await userService.getUserById(token.sub);

                if (userData) {
                    token.totpEnabled = userData.totp_enabled || false;
                    token.requiresTotpSetup = !userData.totp_enabled;
                }
            }

            return token;
        },
    },
    pages: {
        signIn: '/auth/login', // This will be the general routing page
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt' as const,
    },
};
