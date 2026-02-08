"use client"

import { useEffect, useRef, useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  maxBodyHeight?: string
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw]"
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "lg",
  closeOnBackdrop = true,
  showCloseButton = true,
  maxBodyHeight = "70vh"
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-tride-dark/80 backdrop-blur-md transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`bg-tride-card border border-tride-border w-full ${sizeClasses[size]} rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="px-8 py-6 border-b border-tride-border flex justify-between items-center bg-tride-hover">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-10 h-10 rounded-full bg-tride-yellow/20 flex items-center justify-center text-tride-yellow">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-tride-text">{title}</h2>
              {description && (
                <p className="text-sm text-tride-text-muted">{description}</p>
              )}
            </div>
          </div>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-tride-hover rounded-full transition-colors text-tride-text-muted hover:text-tride-text"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div 
          className="p-8 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: maxBodyHeight }}
        >
          {children}
        </div>

        {footer && (
          <div className="px-8 py-5 border-t border-tride-border bg-tride-hover flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface ModalButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
  variant?: "primary" | "secondary" | "danger"
  isLoading?: boolean
  loadingText?: string
}

export function ModalButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
  isLoading = false,
  loadingText = "Loading..."
}: ModalButtonProps) {
  const baseClasses = "px-6 py-2.5 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
  
  const variantClasses = {
    primary: "bg-tride-yellow text-black font-bold hover:bg-tride-yellow/90 shadow-lg shadow-tride-yellow/20",
    secondary: "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover",
    danger: "bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

interface ModalErrorProps {
  message: string
}

export function ModalError({ message }: ModalErrorProps) {
  if (!message) return null
  
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2 mb-6">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {message}
    </div>
  )
}

interface ModalInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  icon?: React.ReactNode
}

export function ModalInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon
}: ModalInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  const dateInputClasses = type === "date" 
    ? "[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
    : ""

  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-tride-text">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tride-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-tride-card border border-tride-border rounded-xl text-tride-text focus:outline-none focus:border-tride-yellow focus:ring-1 focus:ring-tride-yellow transition-all placeholder-tride-text-muted ${
            icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-12" : "pr-4"} py-3 ${dateInputClasses}`}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-tride-text-muted hover:text-tride-text transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  )
}

interface ModalSelectProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  options: { label: string; value: string | number }[]
  placeholder?: string
  required?: boolean
  icon?: React.ReactNode
  disabled?: boolean
  enableSearch?: boolean
}

export function ModalSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  icon,
  disabled = false,
  enableSearch = false
}: ModalSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    if (!isOpen) {
      setSearchQuery("")
    }
  }, [isOpen, enableSearch])

  const selectedOption = options.find(opt => opt.value.toString() === value.toString())
  
  const filteredOptions = enableSearch 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-tride-text">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <div 
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`w-full bg-tride-card border ${isOpen ? 'border-tride-yellow ring-1 ring-tride-yellow' : 'border-tride-border'} rounded-xl text-tride-text transition-all flex items-center justify-between ${
                icon ? "pl-11 pr-4 py-3" : "px-4 py-3"
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-tride-text-muted'}`}
        >
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tride-text-muted pointer-events-none">
                    {icon}
                </div>
            )}
            
            <span className={`truncate mr-2 ${selectedOption ? "text-tride-text" : "text-tride-text-muted"}`}>
                {selectedOption ? selectedOption.label : placeholder}
            </span>

            <div className={`transition-transform duration-200 text-tride-text-muted ${isOpen ? 'rotate-180' : ''}`}>
                 <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
        </div>

        {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-tride-card border border-tride-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 flex flex-col">
                {enableSearch && (
                  <div className="p-2 border-b border-tride-border sticky top-0 bg-tride-card z-10">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full bg-tride-hover border border-tride-border rounded-lg px-3 py-2 text-sm text-tride-text focus:outline-none focus:border-tride-yellow placeholder-tride-text-muted"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                          <div 
                              key={option.value} 
                              onClick={() => {
                                  onChange(option.value.toString())
                                  setIsOpen(false)
                              }}
                              className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between group ${
                                  option.value.toString() === value.toString() 
                                  ? 'bg-tride-yellow/10 text-tride-yellow' 
                                  : 'text-tride-text hover:bg-tride-hover'
                              }`}
                          >
                              <span>{option.label}</span>
                              {option.value.toString() === value.toString() && (
                                  <div className="w-2 h-2 rounded-full bg-tride-yellow"></div>
                              )}
                          </div>
                      ))
                  ) : (
                      <div className="px-4 py-3 text-sm text-tride-text-muted text-center">No options found</div>
                  )}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

interface ModalTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  rows?: number
}

export function ModalTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4
}: ModalTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-tride-text">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-tride-card border border-tride-border rounded-xl text-tride-text focus:outline-none focus:border-tride-yellow focus:ring-1 focus:ring-tride-yellow transition-all placeholder-tride-text-muted px-4 py-3 resize-none"
      />
    </div>
  )
}
