"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Restaurant } from "@/lib/types"
import { StaticMenuDisplay } from "@/components/client-menu/static-menu-display"

export default function StaticClientMenuPage() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const tableNumber = params.tableNumber as string

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing.")
        setLoading(false)
        return
      }

      try {
        const restaurantRes = await fetch(`/api/restaurants/${restaurantId}`)

        if (!restaurantRes.ok) throw new Error("Failed to fetch restaurant details.")

        const restaurantData = await restaurantRes.json()
        setRestaurant(restaurantData)
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.")
        toast({
          title: "Error",
          description: err.message || "Failed to load restaurant details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [restaurantId, toast])

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Menu Content */}
      <div className="flex-1 p-4 lg:p-8">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600 mt-2">Table {tableNumber} - View Menu</p>
          {restaurant.description && <p className="text-gray-500 mt-1">{restaurant.description}</p>}
        </header>
        <StaticMenuDisplay restaurantId={restaurantId} />
      </div>
    </div>
  )
}
