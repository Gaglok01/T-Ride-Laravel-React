"use client"

import { useState, useEffect } from "react"
import { Head, router } from "@inertiajs/react"
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react"
import authService from "@/services/authService"
import { PasswordInput } from "@/components/ui/password-input"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await authService.login({ identifier: email, password })
      console.log("response", response)
      
      if (response.success) {
          // sessionStorage.setItem("adminEmail", email)
          router.visit("/admin")
      } else {
          setError(response.message || "Login failed.")
      }
    } catch (error: any) {
      setIsLoading(false)
      const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again."
      setError(errorMessage)
    }
  }

  return (
    <>
      <Head title="Admin Login - T-RIDE" />
      
      <div className="min-h-screen bg-tride-dark flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-tride-yellow/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-tride-yellow/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-tride-yellow/3 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black tracking-tighter text-tride-text mb-2">
              T-RIDE <span className="inline-block w-3 h-3 bg-tride-yellow rounded-full ml-1"></span>
            </h1>
            <p className="text-tride-text-muted text-sm">Admin Control Panel</p>
          </div>

          <div className="bg-tride-card rounded-3xl p-8 shadow-2xl border border-tride-border backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-tride-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-tride-yellow" />
              </div>
              <h2 className="text-2xl font-bold text-tride-text mb-2">Welcome Back</h2>
              <p className="text-tride-text-muted text-sm">Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-tride-text-muted">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-tride-text-muted group-focus-within:text-tride-yellow transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tride.com"
                    className="w-full pl-12 pr-4 py-4 bg-tride-hover border border-tride-border rounded-xl text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow focus:ring-2 focus:ring-tride-yellow/20 transition-all duration-300"
                    autoComplete="email"
                  />
                </div>
              </div>

                <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-tride-text-muted">
                  Password
                </label>
                <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    icon={Lock}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-5 h-5 border border-tride-border rounded-md flex items-center justify-center group-hover:border-tride-yellow transition-colors">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-3 h-3 bg-tride-yellow rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-tride-text-muted group-hover:text-tride-text transition-colors">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => router.visit("/admin/forgot-password")}
                  className="text-tride-yellow hover:text-tride-yellow/80 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-4 bg-tride-yellow text-black font-bold rounded-xl overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-tride-yellow/25"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>

            {/* <div className="mt-8 text-center">
              <button
                onClick={() => router.visit("/")}
                className="text-tride-text-muted hover:text-tride-text text-sm transition-colors"
              >
                ← Back to Portal Selection
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}
