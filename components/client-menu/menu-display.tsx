"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Image from "next/image"
import type { Category, MenuItem } from "@/lib/types"

interface MenuDisplayProps {
  categories: Category[]
  menuItems: MenuItem[]
  onAddToCart: (item: MenuItem, quantity: number, notes?: string) => void
}

export function MenuDisplay({ categories, menuItems, onAddToCart }: MenuDisplayProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item)
    setQuantity(1)
    setNotes("")
    setDialogOpen(true)
  }

  const handleAddToCart = () => {
    if (selectedItem) {
      onAddToCart(selectedItem, quantity, notes)
      setDialogOpen(false)
    }
  }

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter((item) => item.categoryId === categoryId && item.available)
  }

  return (
    <div>
      {categories.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No menu categories available.</p>
      ) : (
        <Tabs defaultValue={categories[0]?.id} className="w-full">
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
                {getItemsByCategory(category.id).length === 0 ? (
                  <p className="text-muted-foreground col-span-full">No items available in this category.</p>
                ) : (
                  getItemsByCategory(category.id).map((item) => (
                    <Card
                      key={item.id}
                      className="flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleItemClick(item)}
                    >
                      {item.imageUrl && (
                        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
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
                        <Button size="sm">Add to Cart</Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Item Detail / Add to Cart Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>{selectedItem?.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedItem?.imageUrl && (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image
                  src={selectedItem.imageUrl || "/placeholder.svg"}
                  alt={selectedItem.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., No onions, extra sauce"
              />
            </div>
            <div className="text-2xl font-bold text-right">Total: ${(selectedItem?.price || 0) * quantity}</div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddToCart}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
