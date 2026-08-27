import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border-1 bg-surface-container-lowest px-6 py-2 text-base text-foreground transition-all placeholder:text-muted-foreground/60 placeholder:text-xs focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-primary focus:border-primary/80 focus:ring-0",
        error:
          "border-destructive focus:border-destructive/80 focus:ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof inputVariants> {
  size?: "default" | "sm" | "md" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size = "default", ...props }, ref) => {
    const sizeClasses = {
      default: "h-14",
      sm: "h-10",
      md: "h-11",
      lg: "h-16",
    }

    return (
      <input
        type={props.type}
        className={cn(
          inputVariants({ variant }),
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }