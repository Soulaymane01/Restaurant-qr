"use client"

import { useState, useEffect } from "react"
import type { Category, MenuItem } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface StaticMenuDisplayProps {
  restaurantId: string
}

export function StaticMenuDisplay({ restaurantId }: StaticMenuDisplayProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch Categories
        const categoriesRes = await fetch(`/api/categories?restaurantId=${restaurantId}`)
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories")
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.sort((a: Category, b: Category) => a.order - b.order))

        // Fetch Menu Items
        const menuItemsRes = await fetch(`/api/menu-items?restaurantId=${restaurantId}`)
        if (!menuItemsRes.ok) throw new Error("Failed to fetch menu items")
        const menuItemsData = await menuItemsRes.json()
        setMenuItems(menuItemsData.sort((a: MenuItem, b: MenuItem) => a.order - b.order))
      } catch (err: any) {
        console.error("Error fetching static menu data:", err)
        setError(err.message || "Failed to load menu.")
        toast({
          title: "Error",
          description: err.message || "Failed to load menu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) {
      fetchMenuData()
    }
  }, [restaurantId, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>
  }

  if (categories.length === 0 && menuItems.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">No menu items or categories found for this restaurant.</p>
    )
  }

  return (
    <Tabs defaultValue={categories[0]?.id || "all"} className="w-full">
      <TabsList className="flex flex-wrap h-auto p-1 justify-start overflow-x-auto">
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0">
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
          {category.description && <p className="text-muted-foreground mb-6">{category.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter((item) => item.categoryId === category.id && item.available)
              .map((item) => (
                <Card key={item.id} className="flex flex-col">
                  {item.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center mt-auto">
                    <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                  </CardContent>
                </Card>
              ))}
          </div>
          {menuItems.filter((item) => item.categoryId === category.id && item.available).length === 0 && (
            <p className="text-muted-foreground col-span-full">No items available in this category.</p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
