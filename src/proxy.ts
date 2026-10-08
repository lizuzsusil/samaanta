import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/constants'

// Route gate: keeps anonymous traffic off the app. Real permission checks
// happen server-side in pages and server functions (see lib/auth.ts).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const signedIn = request.cookies.has(SESSION_COOKIE)
  const publicPath = pathname === '/login' || pathname === '/forbidden'

  if (!publicPath && !signedIn) {
    const url = new URL('/login', request.url)
    if (pathname !== '/') url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|woff2?)$).*)',
  ],
}
