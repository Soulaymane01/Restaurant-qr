import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuCategories } from "@/components/menu/menu-categories"
import { MenuItems } from "@/components/menu/menu-items"

export default function MenuManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "restaurant", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-2">Manage your menu categories and items.</p>
          </div>

          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="items">Menu Items</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <MenuCategories />
            </TabsContent>
            <TabsContent value="items">
              <MenuItems />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
