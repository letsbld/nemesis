import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const grantType = formData.get('grant_type');
    const code = formData.get('code');
    const redirectUri = formData.get('redirect_uri');
    const clientId = formData.get('client_id');
    const clientSecret = formData.get('client_secret');

    if (grantType !== 'authorization_code') {
        return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
    }

    if (!code || !redirectUri || !clientId) {
        return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    // Validate authorization code
    const authCodeData = await validateAuthorizationCode(code as string);
    if (!authCodeData) {
        return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }

    // Validate client credentials
    const serviceProvider = await validateClient(clientId as string, clientSecret as string);
    if (!serviceProvider) {
        return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
    }

    // Generate tokens
    const accessToken = await generateAccessToken({
        clientId,
        userId: authCodeData.userId,
        scope: authCodeData.scope,
    });

    const idToken = await generateIdToken({
        clientId,
        userId: authCodeData.userId,
        scope: authCodeData.scope,
    });

    // Mark authorization code as used
    await revokeAuthorizationCode(code as string);

    return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: idToken,
        scope: authCodeData.scope,
    });
}

async function validateAuthorizationCode(code: string) {
    // Check in-memory storage (use Redis/DB in production)
    const authCodes = (global as any).authCodes || {};
    const codeData = authCodes[code];

    if (!codeData || codeData.used) {
        return null;
    }

    // Check if code is expired (10 minutes)
    if (Date.now() - codeData.createdAt > 10 * 60 * 1000) {
        return null;
    }

    return codeData;
}

async function validateClient(clientId: string, clientSecret: string | null) {
    // Get service providers (same as auth endpoint)
    const serviceProviders = [
        {
            id: 'test-client',
            clientId: 'test-client-123',
            clientSecret: 'test-secret',
            name: 'Test OIDC Client',
        },
        {
            id: 'aws-oidc',
            clientId: 'aws-console-client',
            clientSecret: 'aws-secret',
            name: 'Amazon Web Services (OIDC)',
        },
    ];

    const provider = serviceProviders.find((sp) => sp.clientId === clientId);

    if (!provider) {
        return null;
    }

    // For public clients, clientSecret might be null
    if (provider.clientSecret && provider.clientSecret !== clientSecret) {
        return null;
    }

    return provider;
}

// Simple JWT implementation using Node.js crypto
function createSimpleJWT(payload: any, secret: string, expiresIn: number = 3600) {
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac('sha256', secret)
        .update(signatureInput)
        .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function generateAccessToken(params: any) {
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const payload = {
        sub: params.userId,
        client_id: params.clientId,
        scope: params.scope,
        iss: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    };

    return createSimpleJWT(payload, secret, 3600);
}

async function generateIdToken(params: any) {
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const payload = {
        sub: params.userId,
        aud: params.clientId,
        email: 'user@example.com', // Get from user data
        name: 'User Name', // Get from user data
        preferred_username: 'username', // Get from user data
        iss: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    };

    return createSimpleJWT(payload, secret, 3600);
}

async function revokeAuthorizationCode(code: string) {
    // Mark code as used
    const authCodes = (global as any).authCodes || {};
    if (authCodes[code]) {
        authCodes[code].used = true;
    }
}
