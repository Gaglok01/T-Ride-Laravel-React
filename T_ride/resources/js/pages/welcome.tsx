import { useEffect } from "react"
import { PortalView } from "@/components/ui/portal-view"
import { router } from "@inertiajs/react"
import authService from "@/services/authService"

export default function Page() {
  // Redirect if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.visit("/admin")
    }
  }, [])

  return <PortalView onSelectAdmin={() => router.visit("/admin/login")} />
}
