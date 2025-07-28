import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QRCodeManager } from "@/components/qr-codes/qr-code-manager"

export default function QRCodeManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "restaurant", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
            <p className="text-gray-600 mt-2">Generate and manage QR codes for your tables.</p>
          </div>
          <QRCodeManager />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
