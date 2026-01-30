"use client"

import { useState, useEffect, useRef } from "react"
import { Head, router } from "@inertiajs/react"
import { ShieldCheck, RefreshCw, Clock, ArrowLeft, CheckCircle } from "lucide-react"
import authService from "@/services/authService"

export default function AdminOTP() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(5 * 60) 
  const [isExpired, setIsExpired] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.visit("/admin")
    }
  }, [])

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("adminEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      router.visit("/admin/login")
    }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (isExpired) return "text-red-500"
    if (timeLeft <= 60) return "text-orange-500"
    if (timeLeft <= 120) return "text-tride-yellow"
    return "text-green-500"
  }

  const getProgress = () => {
    return (timeLeft / (5 * 60)) * 100
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) 
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    setError("")

    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async () => {
    const otpString = otp.join("")
    
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    if (isExpired) {
      setError("OTP has expired. Please request a new one.")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      const res = await authService.verifyOtp({
        identifier: email,
        otp: otpString
      })
      console.log("res", res)
      
      if (res.success) {
          sessionStorage.removeItem("adminEmail")
          router.visit("/admin")
      } else {
          setError(res.message || "Invalid OTP. Please try again.")
      }
    } catch (error: any) {
      setIsVerifying(false)
      
      const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again."
      setError(errorMessage)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError("")

    try {
      const res = await authService.forgotPassword({ email })
      
      if (res.success) {
          setOtp(["", "", "", "", "", ""])
          setTimeLeft(5 * 60)
          setIsExpired(false)
          inputRefs.current[0]?.focus()
      } else {
          setError(res.message || "Failed to resend OTP.")
      }
      
      setIsResending(false)
    } catch (error: any) {
      setIsResending(false)
      
      const errorMessage = error.response?.data?.message || "Failed to resend OTP. Please try again."
      setError(errorMessage)
    }
  }

  const maskEmail = (email: string) => {
    if (!email) return ""
    const [localPart, domain] = email.split("@")
    if (!localPart || !domain) return email
    const masked = localPart.slice(0, 2) + "***" + localPart.slice(-1)
    return `${masked}@${domain}`
  }

  return (
    <>
      <Head title="Verify OTP - T-RIDE Admin" />
      
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-tride-yellow/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tride-yellow/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-tride-yellow/3 rounded-full blur-2xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black tracking-tighter text-foreground mb-2">
              T-RIDE <span className="inline-block w-3 h-3 bg-tride-yellow rounded-full ml-1"></span>
            </h1>
            <p className="text-muted-foreground text-sm">Security Verification</p>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-tride-yellow/10 rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-tride-yellow" />
                </div>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted-foreground/10"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - getProgress() / 100)}`}
                    className={`${getTimerColor()} transition-all duration-1000`}
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Enter Verification Code</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a 6-digit code to
                <br />
                <span className="text-tride-yellow font-medium">{maskEmail(email)}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className={`w-5 h-5 ${getTimerColor()}`} />
              <span className={`text-2xl font-bold font-mono ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </span>
              {isExpired && (
                <span className="text-destructive text-sm ml-2 animate-pulse">Expired!</span>
              )}
            </div>

            <div className="w-full h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  isExpired ? "bg-red-500" : timeLeft <= 60 ? "bg-orange-500" : "bg-tride-yellow"
                }`}
                style={{ width: `${getProgress()}%` }}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm text-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isExpired}
                  className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-300 outline-none
                    ${digit ? "border-tride-yellow bg-tride-yellow/10 text-foreground" : "border-border bg-secondary/50 text-foreground"}
                    ${isExpired ? "opacity-50 cursor-not-allowed" : "focus:border-tride-yellow focus:ring-2 focus:ring-tride-yellow/20"}
                    placeholder-muted-foreground
                  `}
                  placeholder="•"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={isVerifying || isExpired || otp.some((d) => !d)}
              className="relative w-full py-4 bg-tride-yellow text-black font-bold rounded-xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-tride-yellow/25 mb-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isVerifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify & Continue
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <button
              onClick={handleResend}
              disabled={isResending || (!isExpired && timeLeft > 4 * 60)} // Can resend after 1 minute or when expired
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                ${(isExpired || timeLeft <= 4 * 60) 
                  ? "text-tride-yellow hover:bg-tride-yellow/10 cursor-pointer" 
                  : "text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              {isResending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending new code...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {isExpired ? "Resend Code" : timeLeft <= 4 * 60 ? "Resend Code" : `Resend available in ${formatTime(timeLeft - 4 * 60)}`}
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.visit("/admin/login")}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs">
              🔒 Your security is our priority. Never share your OTP with anyone.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
