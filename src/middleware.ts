import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper to get JWT payload from cookie
function getUserFromJWT(req: NextRequest) {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return null;
    try {
        // Replace 'your_jwt_secret' with your actual secret if needed for verification
        const payload = jwt.decode(token);
        return payload as any;
    } catch {
        return null;
    }
}

export function middleware(req: NextRequest) {
    const user = getUserFromJWT(req);
    const pathname = req.nextUrl.pathname;

    // Skip middleware for auth routes
    if (pathname.startsWith('/auth')) {
        return NextResponse.next();
    }

    // Require authentication for protected routes
    if (!user || !user.email) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Check for admin routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        if (user.role !== 'admin') {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    }

    // Handle TOTP requirement for users only
    if (user.role === 'user' && user.requiresTotpSetup === true) {
        if (pathname === '/user/totp') {
            return NextResponse.next();
        }

        if (pathname.startsWith('/api/')) {
            return NextResponse.next();
        }

        const userRoutes = ['/home', '/room', '/user/profile', '/user/settings', '/user/report'];
        const needsRedirect = userRoutes.some(
            (route) => pathname === route || pathname.startsWith(route + '/')
        );

        if (needsRedirect) {
            const url = req.nextUrl.clone();
            url.pathname = '/user/totp';
            url.searchParams.set('required', 'true');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/home/:path*', '/user/:path*', '/room/:path*'],
};
