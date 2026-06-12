/**
 * Reusable validation functions for forms.
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateEmail(email: string): string {
  if (!email.trim()) return "El correo electrónico es requerido."
  if (!isValidEmail(email)) return "Ingresa un correo electrónico válido."
  return ""
}

export function validateRequired(value: string, fieldLabel = "Este campo"): string {
  return value.trim() ? "" : `${fieldLabel} es requerido.`
}

export interface PasswordStrength {
  minLength: boolean
  hasUppercase: boolean
  hasNumberOrSymbol: boolean
}

export function checkPasswordStrength(password: string, minLength = 6): PasswordStrength {
  return {
    minLength: password.length >= minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasNumberOrSymbol: /[0-9!@#$%^&*]/.test(password),
  }
}

export function validatePassword(password: string, minLength = 6, checkStrength = false): string {
  if (!password) return "La contraseña es requerida."
  if (password.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres.`
  }
  if (checkStrength) {
    const strength = checkPasswordStrength(password, minLength)
    if (!strength.hasUppercase) {
      return "La contraseña debe incluir al menos una letra mayúscula."
    }
    if (!strength.hasNumberOrSymbol) {
      return "La contraseña debe incluir al menos un número o símbolo."
    }
  }
  return ""
}

export function validateConfirmPassword(confirmValue: string, passwordValue: string): string {
  if (!confirmValue) return "Confirma la contraseña."
  if (confirmValue !== passwordValue) return "Las contraseñas no coinciden."
  return ""
}
