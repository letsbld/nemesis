import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import { AppDataSource } from './typeorm';
import { Admin } from '../entities/Admin';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ profile }) {
            if (!profile?.email) return false;

            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            const adminRepo = AppDataSource.getRepository(Admin);

            let admin = await adminRepo.findOne({ where: { email: profile.email } });

            if (!admin) {
                admin = adminRepo.create({
                    google_id: profile.sub,
                    email: profile.email,
                    display_name: profile.name,
                    avatar_url: profile.picture,
                });
                await adminRepo.save(admin);
            }

            return true;
        },

        async session({ session }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    role: 'admin',
                },
            };
        },
    },
    pages: {
        signIn: '/auth/google/login', // Optional custom login
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
};
