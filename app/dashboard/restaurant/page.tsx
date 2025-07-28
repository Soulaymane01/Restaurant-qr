import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RestaurantSettings } from "@/components/restaurant/restaurant-settings"

export default function RestaurantSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "restaurant"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
            <p className="text-gray-600 mt-2">Manage your restaurant's profile and details.</p>
          </div>
          <RestaurantSettings />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
