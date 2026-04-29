import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;

  // Si intenta acceder a la raíz o a las rutas protegidas y no tiene token
  if (!authToken && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya tiene token e intenta ir a login o setup, redirigir a la app
  if (authToken && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/setup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/setup'],
};
