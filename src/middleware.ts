import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Next.js middleware runs on the server and cannot access localStorage.
// If JWT is only stored in localStorage, authentication must be handled on the client.
// This middleware will allow all requests to proceed.

export function middleware(req: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/home/:path*', '/user/:path*', '/room/:path*'],
};
