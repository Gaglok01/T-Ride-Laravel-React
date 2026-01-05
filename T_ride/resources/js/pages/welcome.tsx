import { PortalView } from "@/components/ui/portal-view"
import { router } from "@inertiajs/react"

export default function Page() {
  return <PortalView onSelectAdmin={() => router.visit("/admin")} />
}
