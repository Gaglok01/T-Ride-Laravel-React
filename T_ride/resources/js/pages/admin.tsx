import { AdminDashboard } from "@/components/ui/admin-dashboard"
import { AdminLayout } from "@/layouts/admin-layout"

export default function AdminPage() {
  return (
    <AdminLayout title="Operations Overview">
      <AdminDashboard />
    </AdminLayout>
  )
}
