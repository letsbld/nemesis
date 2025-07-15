import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/backend/domains/auth/services/auth.service';
import { NextRequest } from 'next/server';

export async function verifyAdminAuth(): Promise<{ isAdmin: boolean; userId?: string }> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return { isAdmin: false };
        }

        // Check if user has admin role
        if ('role' in session.user && session.user.role === 'admin') {
            return { 
                isAdmin: true, 
                userId: 'id' in session.user ? session.user.id as string : undefined
            };
        }

        return { isAdmin: false };
    } catch (error) {
        console.error('Error verifying admin authentication:', error);
        return { isAdmin: false };
    }
}

export async function verifyAuth(request?: NextRequest): Promise<{
    success: boolean;
    user?: { id: string; role: string; email?: string; name?: string; username?: string };
    error?: string;
}> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Extract user info
        const userRole = 'role' in session.user ? (session.user.role as string) : undefined;
        const userId = 'id' in session.user ? (session.user.id as string) : undefined;
        const username = 'username' in session.user ? (session.user.username as string) : undefined;

        if (!userRole || !userId) {
            return { success: false, error: 'Invalid session data' };
        }

        return {
            success: true,
            user: {
                id: userId,
                role: userRole,
                email: session.user.email || undefined,
                name: session.user.name || undefined,
                username: username,
            },
        };
    } catch (error) {
        console.error('Error verifying authentication:', error);
        return { success: false, error: 'Authentication error' };
    }
}
