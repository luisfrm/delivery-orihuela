"use client"

import { useEffect, useState } from "react"
import { Phone } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  getDialCodeByCountryCode,
} from "@/lib/config/countries"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  /** Teléfono completo en formato E.164 (ej. "+34612345678"). Sin espacios. */
  value: string
  /** Notifica con el E.164 completo. Sin espacios. */
  onChange: (value: string) => void
  /** Mensaje de error a mostrar debajo del input. */
  error?: string
  /** Label visible encima. Default: "Teléfono". */
  label?: string
  /** Marca el campo como requerido (asterisco rojo). */
  required?: boolean
  /** Deshabilita el input y el selector. */
  disabled?: boolean
  /** Placeholder del input de número. */
  numberPlaceholder?: string
}

/**
 * Parsea un string en E.164 (o formato con espacios) y lo separa en
 * `dialCode` (ej. "+34") y `number` (ej. "612 345 678" o "612345678").
 *
 * Maneja tanto el formato nuevo (E.164 sin espacios, ej. "+34612345678")
 * como el formato antiguo legacy con espacios (ej. "+34 612 345 678"),
 * que pueden existir en la DB por registros previos a este cambio.
 */
function parsePhone(value: string): { dialCode: string; number: string } {
  if (!value) {
    return {
      dialCode: getDialCodeByCountryCode(DEFAULT_COUNTRY_CODE),
      number: "",
    }
  }

  // Buscar el dial code más largo que matchee al inicio (ordenado por longitud
  // descendente para que "+351" gane sobre "+3" si Portugal estuviese antes).
  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  )

  for (const country of sorted) {
    if (value.startsWith(country.dialCode)) {
      return {
        dialCode: country.dialCode,
        number: value.slice(country.dialCode.length).trim(),
      }
    }
    // También aceptar el formato sin `+` (ej. "34612345678")
    const digits = country.dialCode.slice(1)
    if (digits.length >= 2 && value.startsWith(digits)) {
      return {
        dialCode: country.dialCode,
        number: value.slice(digits.length).trim(),
      }
    }
  }

  // No match: mantener el dial code default y el resto como número
  return {
    dialCode: getDialCodeByCountryCode(DEFAULT_COUNTRY_CODE),
    number: value.replace(/^\+\d+/, "").trim(),
  }
}

/** Une dialCode + number en formato E.164 sin espacios. */
function buildE164(dialCode: string, number: string): string {
  const digits = number.replace(/\D/g, "")
  if (!digits) return ""
  return `${dialCode}${digits}`
}

export function PhoneInput({
  value,
  onChange,
  error,
  label = "Teléfono",
  required = false,
  disabled = false,
  numberPlaceholder = "612 345 678",
}: PhoneInputProps) {
  // Lazy initializers: corren solo en el primer render y permiten derivar
  // estado inicial desde `value` sin necesidad de useMemo ni useEffect.
  const [dialCode, setDialCode] = useState(() => parsePhone(value).dialCode)
  const [number, setNumber] = useState(() => parsePhone(value).number)

  // Si el valor externo cambia (ej. al cargar el perfil desde la DB),
  // re-sincronizamos el select y el input sin disparar re-render si el
  // valor parseado no cambió.
  useEffect(() => {
    const parsed = parsePhone(value)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDialCode((prev) => (prev === parsed.dialCode ? prev : parsed.dialCode))
    setNumber((prev) => (prev === parsed.number ? prev : parsed.number))
  }, [value])

  const handleNumberChange = (newNumber: string) => {
    // Acepta dígitos y espacios; cualquier otro char se ignora
    const clean = newNumber.replace(/[^\d\s]/g, "")
    setNumber(clean)
    onChange(buildE164(dialCode, clean))
  }

  const handleDialCodeChange = (newDialCode: string) => {
    setDialCode(newDialCode)
    onChange(buildE164(newDialCode, number))
  }

  const countryOptions = COUNTRY_CODES.map((c) => ({
    value: c.dialCode,
    label: `${c.dialCode}  ${c.name}`,
  }))

  return (
    <div className="space-y-1.5">
      <label
        className="text-label-lg text-on-surface pl-1 font-medium"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="requerido">
            *
          </span>
        )}
      </label>
      <div className="flex gap-3">
        <div className="w-fit h-full shrink-0">
          <Select
            options={countryOptions}
            value={dialCode}
            onChange={handleDialCodeChange}
            disabled={disabled}
            size="lg"
          />
        </div>
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="tel"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder={numberPlaceholder}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn("pl-10", error && "border-destructive")}
          />
        </div>
      </div>
      {error && (
        <p className="text-label-md text-destructive pl-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
