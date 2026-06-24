import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ADMIN_ONLY_PATHS = ["/panel/users"]

export async function proxy(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL("/?unauthorized=login_required", request.url)
    )
  }

  const role = user.app_metadata?.role

  if (!role || !["admin", "rider"].includes(role)) {
    return NextResponse.redirect(
      new URL("/?unauthorized=forbidden", request.url)
    )
  }

  const { pathname } = request.nextUrl
  const requiresAdmin = ADMIN_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  if (requiresAdmin && role !== "admin") {
    return NextResponse.redirect(
      new URL("/?unauthorized=forbidden", request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*"],
}