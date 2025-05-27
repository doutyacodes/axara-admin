import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const res = NextResponse.next({
    headers: {
      'Cache-Control': 'no-store',
    }
  });

  const publicRoutes = ['/', '/login', '/signup'];
  const path = req.nextUrl.pathname;

  console.log("pth, path", path)

  // Allow public routes
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
  if (isPublicRoute) {
    return res;
  }

  // Check for token
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    console.log("No token — redirecting to /login");
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role;

    // ✅ Now check per-path access after allowing "/"
    if (path.startsWith('/news-map')) {
      if (role !== 'superadmin' && role !== 'newsmap_admin') {
        console.log("Unauthorized access to /news-map by", role);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } else {
      if (role !== 'superadmin' && role !== 'admin') {
        console.log("Unauthorized access to general route by", role);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return res;
  } catch (error) {
    console.log("JWT verification failed:", error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};

