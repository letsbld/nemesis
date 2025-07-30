import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnService } from '@/backend/domains/auth/services/webauthn.service';

const webauthnService = new WebAuthnService();

// POST /api/auth/passkey/authenticate/begin - Start passkey authentication
export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();

        const result = await webauthnService.generateAuthenticationOptions(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error starting passkey authentication:', error);
        return NextResponse.json({ error: 'Failed to start authentication' }, { status: 500 });
    }
}
