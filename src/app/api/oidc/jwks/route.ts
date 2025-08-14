import { NextResponse } from 'next/server';

export async function GET() {
    // In production, use proper RSA keys
    const jwks = {
        keys: [
            {
                kty: 'oct',
                kid: 'default-key',
                use: 'sig',
                alg: 'HS256',
                k: Buffer.from(process.env.JWT_SECRET || 'secret').toString('base64url'),
            },
        ],
    };

    return NextResponse.json(jwks);
}
