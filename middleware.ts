import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to dashboard after successful auth
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define public and auth routes
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/signup") ||
    request.nextUrl.pathname === "/auth/callback"

  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.includes(".")

  // If no session and trying to access protected route, redirect to login
  if (!isAuthRoute && !isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If session exists and user is on auth route, redirect to appropriate dashboard
  if (session && isAuthRoute) {
    try {
      // Check if user is admin
      const { data: adminData } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

      if (adminData) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      } else {
        // Check if user is examiner
        const { data: examinerData } = await supabase.from("examiners").select("*").eq("id", session.user.id).single()

        if (examinerData) {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }

        // If user has no role but has metadata, try to create examiner profile
        const { data: userData } = await supabase.auth.getUser()

        if (userData?.user?.user_metadata?.role === "examiner" && userData?.user?.user_metadata?.full_name) {
          // Create examiner profile from metadata
          const { error: profileError } = await supabase.from("examiners").insert({
            id: session.user.id,
            full_name: userData.user.user_metadata.full_name,
            age: userData.user.user_metadata.age || 25,
            date_deployed: userData.user.user_metadata.date_deployed || new Date().toISOString().split("T")[0],
            designation: userData.user.user_metadata.designation || "Staff",
            store_area: userData.user.user_metadata.store_area || "Main Branch",
          })

          if (!profileError) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        }

        // If we can't determine the role, redirect to dashboard and let the page handle it
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      console.error("Error in middleware:", error)
      // If there's an error, redirect to dashboard and let the page handle it
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Check role-based access for admin routes
  if (session && request.nextUrl.pathname.startsWith("/admin")) {
    try {
      // Check if user is admin
      const { data: adminData } = await supabase.from("admins").select("*").eq("id", session.user.id).single()

      if (!adminData) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      console.error("Error checking admin role:", error)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
