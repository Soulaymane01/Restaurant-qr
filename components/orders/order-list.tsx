"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Clock, Utensils, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/components/providers/firebase-provider"
import type { Order, OrderItem } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export function OrderList() {
  const { userData, user } = useAuth() // Added user
  const { db, initialized } = useFirebase()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<Order["status"] | "all">("all")
  const { toast } = useToast()

  const fetchOrders = async () => {
    if (!initialized || !db || !userData?.restaurantId || !user) return // Added !user

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/orders?restaurantId=${userData.restaurantId}`, {
        headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
      })
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load orders.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized && db && userData?.restaurantId && user) {
      // Added user
      fetchOrders()
    }
  }, [initialized, db, userData?.restaurantId, user]) // Added user to dependencies

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    if (!db || !userData?.restaurantId || !user) return // Added !user

    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, // Add Authorization header
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update order status")

      toast({
        title: "Success",
        description: `Order ${orderId} status updated to ${newStatus}.`,
      })
      fetchOrders() // Re-fetch orders to update the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </span>
        )
      case "preparing":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
            <Utensils className="h-3 w-3" /> Preparing
          </span>
        )
      case "ready":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
            <Package className="h-3 w-3" /> Ready
          </span>
        )
      case "completed":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        )
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

  const filteredOrders = orders.filter((order) => filterStatus === "all" || order.status === filterStatus)

  const formatDate = (timestamp: any) => {
      try {
        // Handle Firebase Timestamp object with seconds and nanoseconds
        if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
          const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
          return format(date, 'MMM dd, yyyy HH:mm')
        }
        // Handle Firebase Timestamp object with toDate method
        if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
          return format(timestamp.toDate(), 'MMM dd, yyyy HH:mm')
        }
        // Handle regular Date object
        if (timestamp instanceof Date) {
          return format(timestamp, 'MMM dd, yyyy HH:mm')
        }
        // Handle timestamp in seconds (Firebase sometimes returns this)
        if (typeof timestamp === 'number') {
          return format(new Date(timestamp * 1000), 'MMM dd, yyyy HH:mm')
        }
        // Handle ISO string
        if (typeof timestamp === 'string') {
          return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
        }
        return 'N/A'
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'Invalid date'
      }
    }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!userData?.restaurantId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          You need to be associated with a restaurant to manage orders.
        </CardContent>
      </Card>
    )
  }



  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Current Orders</CardTitle>
        <Select value={filterStatus} onValueChange={(value: Order["status"] | "all") => setFilterStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filteredOrders.length === 0 ? (
          <p className="text-center text-muted-foreground">No orders found for the selected status.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-xs">{order.id}</TableCell>
                  <TableCell>{order.tableNumber}</TableCell>
                  <TableCell>{order.customerName || "N/A"}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {order.items.map((item: OrderItem, index: number) => (
                        <li key={index}>
                          {item.quantity}x {item.name} (${item.price.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={order.status}
                      onValueChange={(newStatus: Order["status"]) => handleStatusChange(order.id, newStatus)}
                      disabled={order.status === "completed" || order.status === "cancelled"}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
