import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface DropdownOption {
  value: string | number
  label: string
}

interface DropdownProps {
  value?: string | number | null
  onChange: (value: string) => void
  placeholder?: string
  options: DropdownOption[]
  className?: string
  disabled?: boolean
}

export function Dropdown({ 
  value, 
  onChange, 
  placeholder = "Select option", 
  options, 
  className, 
  disabled 
}: DropdownProps) {
  return (
    <Select
      value={value?.toString()}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger 
        className={cn(
          "w-fit min-w-[150px] bg-tride-card border-tride-border text-tride-text placeholder:text-tride-text-muted focus:ring-tride-yellow focus:ring-offset-0 hover:bg-tride-hover transition-colors",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-tride-card border-tride-border text-tride-text shadow-xl rounded-xl custom-scrollbar">
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value.toString()}
            className="focus:bg-tride-hover focus:text-tride-text cursor-pointer data-[state=checked]:font-bold data-[state=checked]:text-tride-yellow hover:bg-tride-hover/50 transition-colors"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
