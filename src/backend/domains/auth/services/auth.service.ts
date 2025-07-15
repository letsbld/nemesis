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
                    // User is an admin, update their info if needed
                    admin.display_name = user.name;
                    admin.avatar_url = user.image;
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
                    return {
                        ...session,
                        user: {
                            ...session.user,
                            role: 'admin',
                            id: admin.id,
                            displayName: admin.display_name,
                        },
                    };
                }
            }

            // Check if this is a credentials session (user)
            if (token.role === 'user') {
                return {
                    ...session,
                    user: {
                        ...session.user,
                        role: 'user',
                        id: token.sub,
                        displayName: token.name,
                        username: token.username,
                    },
                };
            }

            // Fallback
            return session;
        },

        async jwt({ token, user, account }: any) {
            if (account && user) {
                token.provider = account.provider;
                if (user.role) {
                    token.role = user.role;
                }
                if (user.username) {
                    token.username = user.username;
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
