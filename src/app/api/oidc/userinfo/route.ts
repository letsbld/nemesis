import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);

        const userInfo = await getUserInfo(payload.sub as string);

        return NextResponse.json(userInfo);
    } catch (error) {
        return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }
}

async function getUserInfo(userId: string) {
    // Implement: fetch user information from database
    return {
        sub: userId,
        email: 'user@example.com',
        name: 'User Name',
        preferred_username: 'username',
        email_verified: true,
    };
}
