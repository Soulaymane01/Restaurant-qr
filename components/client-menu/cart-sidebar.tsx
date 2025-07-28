"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MinusCircle, PlusCircle, Trash2, ShoppingCart, Loader2 } from "lucide-react"
import type { CartItem } from "@/lib/types"
import { useState } from "react"

interface CartSidebarProps {
  cartItems: CartItem[]
  onUpdateQuantity: (menuItemId: string, quantity: number) => void
  onRemoveItem: (menuItemId: string) => void
  onCheckout: () => Promise<void>
}

export function CartSidebar({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }: CartSidebarProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const total = cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)

  const handleCheckoutClick = async () => {
    setCheckoutLoading(true)
    try {
      await onCheckout()
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" /> Your Cart
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-center">
            <p>Your cart is empty. Add some delicious items!</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.menuItem.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.menuItem.price.toFixed(2)} x {item.quantity}
                    </p>
                    {item.notes && <p className="text-xs text-muted-foreground italic">Notes: {item.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <MinusCircle className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span className="font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.menuItem.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <div className="p-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-xl font-bold">${total.toFixed(2)}</span>
        </div>
        <Button onClick={handleCheckoutClick} className="w-full" disabled={cartItems.length === 0 || checkoutLoading}>
          {checkoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Place Order
        </Button>
      </div>
    </Card>
  )
}
