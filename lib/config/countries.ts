/**
 * Catálogo de códigos de país soportados en el selector de teléfono.
 * El primero del array es el default al renderizar el selector.
 *
 * El selector UI muestra: bandera + dialCode + nombre (ej. "🇪🇸 +34 España").
 * El valor almacenado es E.164 (ej. "+34612345678", sin espacios).
 */
export interface CountryCode {
  /** Código ISO 3166-1 alfa-2 (no se usa para almacenamiento, solo para identificación) */
  code: string
  /** Nombre legible del país en español */
  name: string
  /** Prefijo telefónico internacional con el `+` (ej. "+34") */
  dialCode: string
  /** Emoji de la bandera para mostrar en el selector */
  flag: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "Reino Unido", dialCode: "+44", flag: "🇬🇧" },
  { code: "FR", name: "Francia", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", dialCode: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italia", dialCode: "+39", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
]

/** Código ISO del país seleccionado por defecto al renderizar el selector. */
export const DEFAULT_COUNTRY_CODE = "ES"

/** Helper para obtener el dialCode por código ISO. */
export function getDialCodeByCountryCode(countryCode: string): string {
  return (
    COUNTRY_CODES.find((c) => c.code === countryCode)?.dialCode ??
    COUNTRY_CODES.find((c) => c.code === DEFAULT_COUNTRY_CODE)!.dialCode
  )
}
