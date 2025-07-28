"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Category, MenuItem, Restaurant } from "@/lib/types"
import { MenuDisplay } from "@/components/client-menu/menu-display"
import { CartSidebar } from "@/components/client-menu/cart-sidebar"
import { useCart } from "@/hooks/use-cart"

export default function ClientMenuPage() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const tableNumber = params.tableNumber as string

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing.")
        setLoading(false)
        return
      }

      try {
        const [restaurantRes, categoriesRes, menuItemsRes] = await Promise.all([
          fetch(`/api/restaurants/${restaurantId}`),
          fetch(`/api/categories?restaurantId=${restaurantId}`),
          fetch(`/api/menu-items?restaurantId=${restaurantId}`),
        ])

        if (!restaurantRes.ok) throw new Error("Failed to fetch restaurant details.")
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories.")
        if (!menuItemsRes.ok) throw new Error("Failed to fetch menu items.")

        const restaurantData = await restaurantRes.json()
        const categoriesData = await categoriesRes.json()
        const menuItemsData = await menuItemsRes.json()

        setRestaurant(restaurantData)
        setCategories(categoriesData.sort((a: Category, b: Category) => a.order - b.order))
        setMenuItems(menuItemsData.sort((a: MenuItem, b: MenuItem) => a.order - b.order))
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.")
        toast({
          title: "Error",
          description: err.message || "Failed to load menu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [restaurantId, toast])

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    if (!restaurantId || !tableNumber) {
      toast({
        title: "Missing Information",
        description: "Restaurant or table information is missing. Cannot place order.",
        variant: "destructive",
      })
      return
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)

    const orderPayload = {
      restaurantId,
      tableNumber: Number(tableNumber),
      items: cartItems.map((item) => ({
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        notes: item.notes,
      })),
      totalAmount,
      status: "pending", // Initial status
      customerName: "Guest", // Can be expanded later
      customerPhone: "", // Can be expanded later
      notes: "", // Can be expanded later
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to place order.")
      }

      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed. Please wait for your food.",
      })
      clearCart()
    } catch (err: any) {
      toast({
        title: "Order Error",
        description: err.message || "There was an issue placing your order.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center text-red-600">
        <p>{error}</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center text-muted-foreground">
        <p>Restaurant not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Main Menu Content */}
      <div className="flex-1 p-4 lg:p-8">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600 mt-2">Table {tableNumber} - Digital Menu</p>
          {restaurant.description && <p className="text-gray-500 mt-1">{restaurant.description}</p>}
        </header>
        <MenuDisplay categories={categories} menuItems={menuItems} onAddToCart={addToCart} />
      </div>

      {/* Cart Sidebar */}
      <div className="lg:w-96 w-full bg-white shadow-lg lg:shadow-none p-4 lg:p-6 border-t lg:border-l border-gray-200">
        <CartSidebar
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}
