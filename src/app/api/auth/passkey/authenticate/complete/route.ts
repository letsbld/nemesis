import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnService } from '@/backend/domains/auth/services/webauthn.service';

const webauthnService = new WebAuthnService();

// POST /api/auth/passkey/authenticate/complete - Complete passkey authentication
export async function POST(request: NextRequest) {
    try {
        const { authenticationResponse, challenge } = await request.json();

        if (!authenticationResponse) {
            return NextResponse.json(
                { error: 'Authentication response is required' },
                { status: 400 }
            );
        }

        const result = await webauthnService.verifyAuthentication(
            authenticationResponse,
            challenge
        );

        if (result.verified) {
            return NextResponse.json({
                success: true,
                user: result.user,
            });
        } else {
            return NextResponse.json(
                { error: 'Authentication verification failed' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error completing passkey authentication:', error);
        return NextResponse.json({ error: 'Failed to complete authentication' }, { status: 500 });
    }
}
