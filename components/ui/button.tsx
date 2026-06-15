import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 transition-all duration-300 ease-out active:scale-[0.96]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/85 border-white/50",
        secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim",
        tertiary: "bg-card text-card-foreground border-border hover:border-primary/30 hover:bg-muted/50",
        outline: "hover:bg-white border-white/60 text-white hover:text-foreground hover:border-white",
        outline_primary: "hover:bg-primary border-primary/60 text-primary hover:text-white hover:border-primary",
        ghost: "hover:bg-accent border-transparent text-foreground hover:border-border",
        link: "border-transparent text-black hover:underline underline-offset-4", // add separation from text and underline
        toolbar: "bg-white text-primary hover:bg-muted shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-8 px-3 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-full",
        icon: "size-10 rounded-lg",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9 rounded-lg",
        "icon-xl": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }