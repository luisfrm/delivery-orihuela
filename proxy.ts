import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const ADMIN_ONLY_PATHS = ["/panel/users"]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca la sesión si ha caducado y guarda las nuevas cookies en supabaseResponse
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Solo aplicar lógica de autorización estricta en rutas de administración (/panel)
  if (pathname.startsWith("/panel")) {
    if (!user) {
      const res = NextResponse.redirect(new URL("/?unauthorized=login_required", request.url))
      // Preservar las cookies (ej: borrado de sesión o tokens actualizados) en la redirección
      supabaseResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") res.headers.append(key, value)
      })
      return res
    }

    const role = user.app_metadata?.role

    if (!role || !["admin", "rider"].includes(role)) {
      const res = NextResponse.redirect(new URL("/?unauthorized=forbidden", request.url))
      supabaseResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") res.headers.append(key, value)
      })
      return res
    }

    const requiresAdmin = ADMIN_ONLY_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )

    if (requiresAdmin && role !== "admin") {
      const res = NextResponse.redirect(new URL("/?unauthorized=forbidden", request.url))
      supabaseResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") res.headers.append(key, value)
      })
      return res
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Ejecutar el middleware en TODAS las rutas para mantener la sesión viva,
     * excluyendo archivos estáticos, imágenes, y assets de next.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}