"use server"

import { createClient } from "@/lib/supabase/server"
import { UserRole } from "@/lib/types"

export type AuthErrorCode =
  | "email_not_confirmed"
  | "invalid_credentials"
  | "user_already_registered"
  | "invalid_token"
  | "token_expired"
  | "rate_limited"
  | "database_error"
  | "permission_denied"
  | "auth_failed"

export interface AuthResult {
  success?: boolean
  error?: string
  code?: AuthErrorCode
}

const AUTH_ERROR_MAP: Record<string, { code: AuthErrorCode; message: string }> = {
  "User already registered": {
    code: "user_already_registered",
    message: "Este correo ya está registrado. Intenta iniciar sesión.",
  },
  "Invalid login credentials": {
    code: "invalid_credentials",
    message: "Correo o contraseña incorrectos.",
  },
  "Email not confirmed": {
    code: "email_not_confirmed",
    message: "Tu email aún no está verificado.",
  },
  "email_not_confirmed": {
    code: "email_not_confirmed",
    message: "Tu email aún no está verificado.",
  },
  "Token has expired or is invalid": {
    code: "token_expired",
    message: "El código es inválido o expiró. Solicita uno nuevo.",
  },
  "otp_expired": {
    code: "token_expired",
    message: "El código expiró. Solicita uno nuevo.",
  },
  "Invalid token": {
    code: "invalid_token",
    message: "El código es inválido. Verifica e intenta de nuevo.",
  },
  "Database error saving new user": {
    code: "database_error",
    message: "Error al guardar el usuario. Intenta de nuevo.",
  },
  "new row violates row-level security policy": {
    code: "permission_denied",
    message: "No tienes permisos para realizar esta acción.",
  },
  "Too many requests": {
    code: "rate_limited",
    message: "Demasiados intentos. Espera un momento e intenta de nuevo.",
  },
  "over_email_send_rate_limit": {
    code: "rate_limited",
    message: "Has solicitado demasiados códigos. Espera un momento.",
  },
}

const DEFAULT_AUTH_ERROR = {
  code: "auth_failed" as AuthErrorCode,
  message: "Ocurrió un error. Intenta de nuevo.",
}

function mapAuthError(rawMessage: string): { code: AuthErrorCode; message: string } {
  if (AUTH_ERROR_MAP[rawMessage]) {
    return AUTH_ERROR_MAP[rawMessage]
  }
  for (const [key, val] of Object.entries(AUTH_ERROR_MAP)) {
    if (rawMessage.includes(key)) {
      return val
    }
  }
  return DEFAULT_AUTH_ERROR
}

export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string
): Promise<AuthResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
      },
    },
  })

  if (error) {
    console.error("[signUpWithEmail]", error.message)
    const mapped = mapAuthError(error.message)
    return { error: mapped.message, code: mapped.code }
  }

  // Check if the user already exists (anti-user-enumeration protection)
  // If the email is already registered and confirmed, signUp returns success but with an empty identities array
  const user = data?.user
  if (!user || (user.identities && user.identities.length === 0)) {
    return {
      error: "Este correo ya está registrado. Intenta iniciar sesión.",
      code: "user_already_registered",
    }
  }

  return { success: true }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("[signInWithEmail]", error.message)
    const mapped = mapAuthError(error.message)
    return { error: mapped.message, code: mapped.code }
  }

  return { success: true }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
    },
  })

  if (error) {
    console.error("[signInWithGoogle]", error.message)
    const mapped = mapAuthError(error.message)
    return { error: mapped.message, code: mapped.code }
  }

  if (data?.url) {
    throw new RedirectError(data.url)
  }

  return { success: true }
}

export async function signInWithApple(): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
    },
  })

  if (error) {
    console.error("[signInWithApple]", error.message)
    const mapped = mapAuthError(error.message)
    return { error: mapped.message, code: mapped.code }
  }

  return { success: true }
}

export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("[signOut]", error.message)
    return { error: "No se pudo cerrar sesión" }
  }

  return { success: true }
}

export async function verifyOtp(
  email: string,
  token: string
): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  })

  if (error) {
    console.error("[verifyOtp]", error.message)
    const mapped = mapAuthError(error.message)
    return { error: mapped.message, code: mapped.code }
  }

  return { success: true }
}

export async function resendOtp(email: string): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    email,
    type: "signup",
  })

  if (error) {
    console.error("[resendOtp]", error.message)
    return { error: "No se pudo reenviar el código" }
  }

  return { success: true }
}

export async function getUserRole(): Promise<{ role: UserRole | null; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { role: null, error: authError?.message ?? "Usuario no encontrado" }
  }

  // Role lives in app_metadata (server-only, not editable by the client)
  // It travels in the JWT — no extra DB query needed
  const role = (user.app_metadata?.role ?? null) as UserRole | null
  return { role }
}

class RedirectError extends Error {
  url: string

  constructor(url: string) {
    super("Redirect required")
    this.url = url
    this.name = "RedirectError"
  }
}

export async function isRedirectError(error: unknown): Promise<boolean> {
  return error instanceof RedirectError
}

export async function getRedirectUrl(error: unknown): Promise<string | null> {
  if (error instanceof RedirectError) {
    return error.url
  }
  return null
}