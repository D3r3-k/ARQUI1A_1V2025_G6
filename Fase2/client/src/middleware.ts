import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isLoggedIn = request.cookies.get('auth')?.value === 'true';
    const { pathname } = request.nextUrl;

    if (isLoggedIn && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (!isLoggedIn && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/dashboard/:path*'],
};
