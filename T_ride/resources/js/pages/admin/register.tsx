"use client"

import { useState, useEffect } from "react"
import { Head, router } from "@inertiajs/react"
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from "lucide-react"
import authService from "@/services/authService"

export default function AdminRegister() {
  const [name, setName] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.visit("/admin")
    }
  }, [])
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!name || !email || !phone || !password) {
      setError("Please fill in all fields")
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await authService.register({
        name,
        email,
        phone_number: phone,
        password,
        role: "admin"
      })
      console.log("response", response)
      // Navigate to login page
      router.visit("/admin/login")
    } catch (error: any) {
      setIsLoading(false)
      
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again."
      setError(errorMessage)
    }
  }

  return (
    <>
      <Head title="Admin Register - T-RIDE" />
      
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
            <p className="text-tride-text-muted text-sm">Admin Registration</p>
          </div>

          <div className="bg-tride-card rounded-3xl p-8 shadow-2xl border border-tride-border backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-tride-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-tride-yellow" />
              </div>
              <h2 className="text-2xl font-bold text-tride-text mb-2">Create Account</h2>
              <p className="text-tride-text-muted text-sm">Join the admin team</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-tride-text-muted">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-tride-text-muted group-focus-within:text-tride-yellow transition-colors" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-tride-hover border border-tride-border rounded-xl text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow focus:ring-2 focus:ring-tride-yellow/20 transition-all duration-300"
                    autoComplete="name"
                  />
                </div>
              </div>

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
                <label htmlFor="phone" className="block text-sm font-medium text-tride-text-muted">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-tride-text-muted group-focus-within:text-tride-yellow transition-colors" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full pl-12 pr-4 py-4 bg-tride-hover border border-tride-border rounded-xl text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow focus:ring-2 focus:ring-tride-yellow/20 transition-all duration-300"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-tride-text-muted">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-tride-text-muted group-focus-within:text-tride-yellow transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-12 pr-12 py-4 bg-tride-hover border border-tride-border rounded-xl text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow focus:ring-2 focus:ring-tride-yellow/20 transition-all duration-300"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-tride-text-muted hover:text-tride-yellow transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-4 bg-tride-yellow text-black font-bold rounded-xl overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-tride-yellow/25 mt-6"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <UserPlus className="w-5 h-5" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.visit("/admin/login")}
                className="text-tride-text-muted hover:text-tride-text text-sm transition-colors"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
