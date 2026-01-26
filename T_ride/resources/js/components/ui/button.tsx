import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 transform active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:transform-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tride-dark",
  {
    variants: {
      variant: {
        default:
          "bg-tride-yellow text-black shadow-lg shadow-tride-yellow/20 hover:bg-tride-yellow/90 hover:shadow-tride-yellow/30 focus-visible:ring-tride-yellow",
        destructive:
          "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 focus-visible:ring-red-500",
        outline:
          "border-2 border-tride-yellow text-tride-yellow hover:bg-tride-yellow hover:text-black focus-visible:ring-tride-yellow",
        secondary:
          "bg-tride-hover text-tride-text border border-tride-border hover:bg-tride-card focus-visible:ring-tride-yellow/50",
        ghost: 
          "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover focus-visible:ring-tride-yellow/50",
        link: 
          "text-tride-yellow underline-offset-4 hover:underline focus-visible:ring-tride-yellow",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

// Icon Button Component
export interface IconButtonProps
  extends React.ComponentProps<"button"> {
  variant?: "default" | "danger" | "success"
  size?: "sm" | "md" | "lg"
  tooltip?: string
}

function IconButton({
  className,
  variant = "default",
  size = "md",
  tooltip,
  ...props
}: IconButtonProps) {
  
  const variantClasses = {
    default: "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover",
    danger: "text-red-500/50 hover:text-red-500 hover:bg-red-500/10",
    success: "text-green-500/50 hover:text-green-500 hover:bg-green-500/10"
  }

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3"
  }

  return (
    <button
      type="button"
      title={tooltip}
      className={cn(
        "flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export { Button, IconButton, buttonVariants }
