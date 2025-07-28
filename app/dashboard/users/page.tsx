import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserManager } from "@/components/users/user-manager"

export default function UserManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "restaurant", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and their roles within the system.</p>
          </div>
          <UserManager />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
