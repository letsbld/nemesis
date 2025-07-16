import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../backend/domains/auth/services/auth.service';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({
                error: 'No session found',
                session: null,
            });
        }

        return NextResponse.json({
            session: {
                user: session.user,
                expires: session.expires,
            },
            debug: {
                hasRole: 'role' in session.user,
                role: (session.user as any)?.role,
                totpEnabled: (session.user as any)?.totpEnabled,
                requiresTotpSetup: (session.user as any)?.requiresTotpSetup,
            },
        });
    } catch (error) {
        console.error('Session debug error:', error);
        return NextResponse.json({
            error: 'Failed to get session',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
