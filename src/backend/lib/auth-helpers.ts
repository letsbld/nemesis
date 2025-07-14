import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/backend/domains/auth/services/auth.service';

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
