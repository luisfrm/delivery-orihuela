"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  digits?: number
  disabled?: boolean
}

export function OtpInput({ 
  value, 
  onChange, 
  digits = 8,
  disabled = false 
}: OtpInputProps) {
  const halfPoint = Math.ceil(digits / 2)
  
  return (
    <InputOTP
      maxLength={digits}
      value={value}
      onChange={onChange}
      pattern={REGEXP_ONLY_DIGITS}
      disabled={disabled}
    >
      <InputOTPGroup>
        {Array.from({ length: halfPoint }, (_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {Array.from({ length: digits - halfPoint }, (_, i) => (
          <InputOTPSlot key={halfPoint + i} index={halfPoint + i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}