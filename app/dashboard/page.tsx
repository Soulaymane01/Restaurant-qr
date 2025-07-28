"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Menu, ShoppingCart, QrCode, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/components/providers/firebase-provider"
import { useToast } from "@/components/ui/use-toast"
import type { MenuItem, Order, QRCode } from "@/lib/types"

export default function DashboardPage() {
  const { userData, user, loading: authLoading } = useAuth()
  const { initialized, error: firebaseError } = useFirebase()
  const [loadingData, setLoadingData] = useState(true)
  const [menuItemCount, setMenuItemCount] = useState(0)
  const [todaysOrdersCount, setTodaysOrdersCount] = useState(0)
  const [activeTablesCount, setActiveTablesCount] = useState(0)
  const [todaysRevenue, setTodaysRevenue] = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      if (!initialized || !user || !userData?.restaurantId) {
        setLoadingData(false)
        return
      }

      setLoadingData(true)
      try {
        const idToken = await user.getIdToken()

        // Fetch Menu Items
        const menuItemsRes = await fetch(`/api/menu-items?restaurantId=${userData.restaurantId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (!menuItemsRes.ok) throw new Error("Failed to fetch menu items")
        const menuItemsData: MenuItem[] = await menuItemsRes.json()
        setMenuItemCount(menuItemsData.length)

        // Fetch QR Codes (Active Tables)
        const qrCodesRes = await fetch(`/api/qr-codes?restaurantId=${userData.restaurantId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (!qrCodesRes.ok) throw new Error("Failed to fetch QR codes")
        const qrCodesData: QRCode[] = await qrCodesRes.json()
        setActiveTablesCount(qrCodesData.length)

        // Fetch Orders for Today's Orders and Revenue
        const ordersRes = await fetch(`/api/orders?restaurantId=${userData.restaurantId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (!ordersRes.ok) throw new Error("Failed to fetch orders")
        const ordersData: Order[] = await ordersRes.json()

        const today = new Date()
        today.setHours(0, 0, 0, 0) // Start of today

        const todaysOrders = ordersData.filter((order) => {
          const orderDate = new Date(order.createdAt)
          orderDate.setHours(0, 0, 0, 0)
          return orderDate.getTime() === today.getTime()
        })

        setTodaysOrdersCount(todaysOrders.length)
        setTodaysRevenue(todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0))

        // Set Recent Orders (last 3-5, sorted by creation date)
        const sortedOrders = ordersData.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        setRecentOrders(sortedOrders.slice(0, 5)) // Show up to 5 recent orders
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (initialized && !authLoading && !firebaseError && userData?.restaurantId) {
      fetchData()
    }
  }, [initialized, authLoading, firebaseError, userData?.restaurantId, user, toast])

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
            Pending
          </span>
        )
      case "preparing":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
            Preparing
          </span>
        )
      case "ready":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
            Ready
          </span>
        )
      case "completed":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
            Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
            Cancelled
          </span>
        )
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "restaurant", "manager", "worker"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your restaurant management system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                <Menu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{menuItemCount}</div>
                <p className="text-xs text-muted-foreground">Active menu items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysOrdersCount}</div>
                <p className="text-xs text-muted-foreground">Orders received today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTablesCount}</div>
                <p className="text-xs text-muted-foreground">Tables with QR codes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${todaysRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total revenue today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your restaurant</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground">No recent orders.</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Table {order.tableNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item(s) • ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="font-medium">Add New Menu Item</div>
                    <div className="text-sm text-muted-foreground">Create a new dish for your menu</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="font-medium">Generate QR Code</div>
                    <div className="text-sm text-muted-foreground">Create QR code for a new table</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="font-medium">View All Orders</div>
                    <div className="text-sm text-muted-foreground">Manage incoming orders</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
