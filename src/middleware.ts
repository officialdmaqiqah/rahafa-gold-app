import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || "default_rahafa_secret_key_12345";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  let session = null

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, key, {
        algorithms: ["HS256"],
      })
      session = payload
      console.log("Middleware: Session valid for", session.userId);
    } catch (error) {
      console.error("Middleware: JWT Error:", error);
      session = null
    }
  } else {
    console.log("Middleware: No session cookie found");
  }

  const isLoginPage = request.nextUrl.pathname === '/login'

  // If user is not logged in and tries to access any page other than login
  if (!session && !isLoginPage) {
    const loginUrl = new URL('/login', request.url);
    if (sessionCookie) {
      loginUrl.searchParams.set('error', 'session_invalid');
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and tries to access login page
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
