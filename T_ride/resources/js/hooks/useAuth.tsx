import React, { useEffect, useState } from "react"
import { router } from "@inertiajs/react"
import authService from "@/services/authService"

/**
 * Higher-order component to protect admin routes
 * Usage: Wrap your admin pages with this component
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    // Check authentication on mount
    useEffect(() => {
      if (!authService.isAuthenticated()) {
        router.visit("/admin/login")
      }
    }, [])

    // Don't render component if not authenticated
    if (!authService.isAuthenticated()) {
      return null
    }

    return <Component {...props} />
  }
}

/**
 * Hook to get current user
 */
export function useAuth() {
  const [user, setUser] = useState(authService.getUser())
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  )

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    router.visit("/admin/login")
  }

  const refreshUser = () => {
    setUser(authService.getUser())
    setIsAuthenticated(authService.isAuthenticated())
  }

  return {
    user,
    isAuthenticated,
    logout,
    refreshUser,
  }
}
