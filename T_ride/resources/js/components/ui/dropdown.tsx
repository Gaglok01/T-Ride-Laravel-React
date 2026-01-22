
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
          "w-fit min-w-[150px] bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:ring-tride-yellow focus:ring-offset-0",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#1C1C1E] border-white/10 text-white">
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value.toString()}
            className="focus:bg-white/10 focus:text-white cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
