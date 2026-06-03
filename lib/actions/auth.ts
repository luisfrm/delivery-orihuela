"use server"

import { createClient } from "@/lib/supabase/server"

export interface AuthResult {
  success?: boolean
  error?: string
  code?: 'email_not_confirmed' | 'invalid_credentials' | 'auth_failed'
}

export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string
): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
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
    return { error: error.message }
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
    const isEmailNotConfirmed = 
      error.message.includes('Email not confirmed') ||
      error.message.includes('email_not_confirmed')
    
    return { 
      error: error.message,
      code: isEmailNotConfirmed ? 'email_not_confirmed' : 'auth_failed'
    }
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
    return { error: error.message }
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
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
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
    return { error: error.message }
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
    return { error: error.message }
  }

  return { success: true }
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