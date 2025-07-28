import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OrderList } from "@/components/orders/order-list"

export default function OrderManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "restaurant", "manager", "worker"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">View and manage all incoming orders.</p>
          </div>
          <OrderList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
