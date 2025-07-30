import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnService } from '@/backend/domains/auth/services/webauthn.service';

const webauthnService = new WebAuthnService();

// POST /api/auth/passkey/register/begin - Start passkey registration
export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const result = await webauthnService.generateRegistrationOptions(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error starting passkey registration:', error);
        return NextResponse.json({ error: 'Failed to start registration' }, { status: 500 });
    }
}
