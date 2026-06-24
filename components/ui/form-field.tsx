"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  maxLength?: number
  disabled?: boolean
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  children,
  maxLength,
  disabled,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password" || name.includes("password")
  const inputType = isPassword && showPassword ? "text" : type

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="text-label-lg text-on-surface pl-1 font-medium"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            icon && "pl-11",
            isPassword && "pr-11",
            error && "border-destructive"
          )}
          aria-invalid={!!error}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      {children}
      {error && (
        <p className="text-label-md text-destructive pl-1">{error}</p>
      )}
    </div>
  )
}