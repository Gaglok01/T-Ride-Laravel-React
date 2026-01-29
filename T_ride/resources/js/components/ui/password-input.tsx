"use client"

import * as React from "react"
import { Eye, EyeOff, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, icon: Icon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-tride-text-muted group-focus-within:text-tride-yellow transition-colors" />
          </div>
        )}
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "w-full py-4 bg-tride-hover border border-tride-border rounded-xl text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow focus:ring-2 focus:ring-tride-yellow/20 transition-all duration-300",
            Icon ? "pl-12" : "pl-4",
            "pr-12", // Always space for the toggle button
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-tride-text-muted hover:text-tride-yellow transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
