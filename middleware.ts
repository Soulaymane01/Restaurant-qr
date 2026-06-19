import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-jwt-secret-change-in-production")

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/auth")) return NextResponse.next()

  const requireAuth = pathname.startsWith("/admin") || pathname.startsWith("/api/")

  if (!requireAuth) return NextResponse.next()

  const session = request.cookies.get("session")

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    await jwtVerify(session.value, secret)
    return NextResponse.next()
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const res = NextResponse.redirect(new URL("/login", request.url))
    res.cookies.delete("session")
    return res
  }
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/:path*"],
}
