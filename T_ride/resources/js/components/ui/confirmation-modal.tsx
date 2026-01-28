"use client"

import { useEffect, useRef } from "react"
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"

interface ConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to close the modal */
  onClose: () => void
  /** Function called when user confirms the action */
  onConfirm: () => void
  /** Modal title */
  title: string
  /** Description/message explaining the action */
  description: string
  /** Text for the confirm button */
  confirmText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** Whether confirm action is in progress */
  isLoading?: boolean
  /** Visual variant of the modal */
  variant?: "danger" | "warning" | "success" | "info"
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-500",
    buttonBg: "bg-red-500 hover:bg-red-600",
    buttonShadow: "shadow-red-500/20"
  },
  warning: {
    icon: AlertCircle,
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-500",
    buttonBg: "bg-orange-500 hover:bg-orange-600",
    buttonShadow: "shadow-orange-500/20"
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-green-500/20",
    iconColor: "text-green-500",
    buttonBg: "bg-green-500 hover:bg-green-600",
    buttonShadow: "shadow-green-500/20"
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
    buttonBg: "bg-blue-500 hover:bg-blue-600",
    buttonShadow: "shadow-blue-500/20"
  }
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger"
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const config = variantConfig[variant]
  const IconComponent = config.icon

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose()
      }
    }
    
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, isLoading, onClose])

  // Prevent body scroll when modal is open
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

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
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
        className="bg-tride-card border border-tride-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header with Close Button */}
        <div className="relative px-6 pt-6">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 hover:bg-tride-hover rounded-full transition-colors text-tride-text-muted hover:text-tride-text disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <IconComponent size={32} className={config.iconColor} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-tride-text mb-2">{title}</h3>

          {/* Description */}
          <p className="text-tride-text-muted text-sm leading-relaxed">{description}</p>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-tride-border bg-tride-hover flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-tride-text-muted hover:text-tride-text hover:bg-tride-card transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white ${config.buttonBg} shadow-lg ${config.buttonShadow} transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
