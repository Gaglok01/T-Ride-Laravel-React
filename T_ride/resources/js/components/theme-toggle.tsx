"use client"

import { useAppearance, type Appearance } from "@/hooks/use-appearance"
import { Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "icon" | "dropdown" | "pills"
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { appearance, updateAppearance } = useAppearance()

  const getNextTheme = (): Appearance => {
    const themes: Appearance[] = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(appearance)
    return themes[(currentIndex + 1) % themes.length]
  }

  const getCurrentIcon = () => {
    switch (appearance) {
      case "dark":
        return <Moon size={18} />
      case "light":
        return <Sun size={18} />
      default:
        return <Monitor size={18} />
    }
  }

  const getLabel = () => {
    switch (appearance) {
      case "dark":
        return "Dark"
      case "light":
        return "Light"
      default:
        return "System"
    }
  }

  if (variant === "pills") {
    const themes: { value: Appearance; icon: React.ReactNode; label: string }[] = [
      { value: "light", icon: <Sun size={16} />, label: "Light" },
      { value: "dark", icon: <Moon size={16} />, label: "Dark" },
      { value: "system", icon: <Monitor size={16} />, label: "System" },
    ]

    return (
      <div
        className={cn(
          "flex gap-1 p-1 rounded-xl bg-tride-card border border-[var(--tride-border)]",
          className
        )}
      >
        {themes.map(({ value, icon, label }) => (
          <button
            key={value}
            onClick={() => updateAppearance(value)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              appearance === value
                ? "bg-tride-yellow text-black shadow-sm"
                : "text-[var(--tride-text-muted)] hover:text-[var(--tride-text)] hover:bg-[var(--tride-hover)]"
            )}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    )
  }

  if (variant === "dropdown") {
    return (
      <div className={cn("relative group", className)}>
        <button
          className="p-2 rounded-lg hover:bg-[var(--tride-hover)] text-[var(--tride-text-muted)] hover:text-[var(--tride-text)] transition-colors"
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
        </button>
        <div className="absolute right-0 top-full mt-2 py-2 w-36 bg-tride-card border border-[var(--tride-border)] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {["light", "dark", "system"].map((theme) => (
            <button
              key={theme}
              onClick={() => updateAppearance(theme as Appearance)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                appearance === theme
                  ? "text-tride-yellow bg-tride-yellow/10"
                  : "text-[var(--tride-text)] hover:bg-[var(--tride-hover)]"
              )}
            >
              {theme === "light" && <Sun size={16} />}
              {theme === "dark" && <Moon size={16} />}
              {theme === "system" && <Monitor size={16} />}
              <span className="capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Default icon variant - cycles through themes on click
  return (
    <button
      onClick={() => updateAppearance(getNextTheme())}
      className={cn(
        "relative p-2 rounded-lg hover:bg-[var(--tride-hover)] text-[var(--tride-text-muted)] hover:text-[var(--tride-text)] transition-all duration-200 group",
        className
      )}
      aria-label={`Current theme: ${getLabel()}. Click to change`}
      title={`Theme: ${getLabel()}`}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            appearance === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          )}
        />
        <Moon
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            appearance === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          )}
        />
        <Monitor
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            appearance === "system"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          )}
        />
      </div>
    </button>
  )
}
