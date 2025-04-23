import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value
  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"]

  if (publicRoutes.includes(path)) {
    // If user is already logged in, redirect to their dashboard
    if (userId) {
      // We don't know the role here, so we'll redirect to the home page
      // which will then redirect to the appropriate dashboard
      return NextResponse.redirect(new URL("/api/auth/redirect", request.url))
    }
    return NextResponse.next()
  }

  // Protected routes that require authentication
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control will be handled in the layout components
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/register", "/admin/:path*", "/worker/:path*", "/auditor/:path*"],
}
