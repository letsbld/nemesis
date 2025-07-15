import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/backend/lib/auth-helpers';

export async function GET() {
    try {
        console.log('Test endpoint called');

        // Verify admin authentication
        const authResult = await verifyAdminAuth();
        console.log('Auth result:', authResult);

        if (!authResult.isAdmin) {
            console.log('Not admin, returning 401');
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        console.log('Admin authenticated successfully');
        return NextResponse.json({
            message: 'Authentication successful',
            userId: authResult.userId,
        });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
