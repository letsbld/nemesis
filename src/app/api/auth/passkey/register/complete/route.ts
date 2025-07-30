import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnService } from '@/backend/domains/auth/services/webauthn.service';

const webauthnService = new WebAuthnService();

// POST /api/auth/passkey/register/complete - Complete passkey registration
export async function POST(request: NextRequest) {
    try {
        const { userId, registrationResponse } = await request.json();

        if (!userId || !registrationResponse) {
            return NextResponse.json(
                { error: 'User ID and registration response are required' },
                { status: 400 }
            );
        }

        const result = await webauthnService.verifyRegistration(userId, registrationResponse);

        if (result.verified) {
            return NextResponse.json({
                success: true,
                message: 'Passkey registered successfully',
                passkeyId: result.passkeyId,
            });
        } else {
            return NextResponse.json(
                { error: 'Registration verification failed' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error completing passkey registration:', error);
        return NextResponse.json({ error: 'Failed to complete registration' }, { status: 500 });
    }
}
