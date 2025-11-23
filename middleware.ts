import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const studentRoutes = ["/dashboard", "/profile"]
const adminRoutes = ["/admin"]
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if user is authenticated
  const isAuthenticated = request.cookies.has("auth_token")
  const token = request.cookies.get("auth_token")?.value
  
  // Decode token to check role (simple base64 decode of JWT payload)
  let userRole = null
  if (token) {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
      userRole = decoded.role
    } catch (e) {
      // Invalid token format
    }
  }
  
  const isAdmin = userRole === "ADMIN"
  const isStudent = userRole === "STUDENT"

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated) {
    if (studentRoutes.some((route) => pathname.startsWith(route)) || 
        adminRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  // If authenticated, enforce role-based access
  if (isAuthenticated) {
    // Admin trying to access student routes - redirect to admin dashboard
    if (isAdmin && studentRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    // Student trying to access admin routes - redirect to home
    if (isStudent && adminRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Redirect from auth pages based on role
    if (authRoutes.some((route) => pathname.startsWith(route))) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
