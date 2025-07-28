import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Add any middleware logic here for route protection
  // This is a basic implementation - you might want to add more sophisticated checks

  const { pathname } = request.nextUrl

  // Allow public routes
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/menu") ||
    pathname.startsWith("/api/menu") ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // For protected routes, let the client-side handle authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
