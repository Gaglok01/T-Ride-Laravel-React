"use client"

import { useState } from "react"
import { PortalView } from "@/components/ui/portal-view"
import { AdminDashboard } from "@/components/ui/admin-dashboard"

export default function Page() {
  const [view, setView] = useState<"portal" | "admin">("portal")

  if (view === "admin") {
    return <AdminDashboard onBack={() => setView("portal")} />
  }

  return <PortalView onSelectAdmin={() => setView("admin")} />
}
