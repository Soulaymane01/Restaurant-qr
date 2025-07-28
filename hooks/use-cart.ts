"use client"

import { useState, useEffect, useCallback } from "react"
import type { MenuItem, CartItem } from "@/lib/types"

const CART_STORAGE_KEY = "restaurant_app_cart"

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate cart from localStorage on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart))
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e)
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      }
      setIsHydrated(true)
    }
  }, [])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    }
  }, [cartItems, isHydrated])

  const addToCart = useCallback((menuItem: MenuItem, quantity: number, notes?: string) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.menuItem.id === menuItem.id)

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          notes: notes || updatedItems[existingItemIndex].notes, // Update notes if provided
        }
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, { menuItem, quantity, notes }]
      }
    })
  }, [])

  const updateQuantity = useCallback((menuItemId: string, newQuantity: number) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.menuItem.id !== menuItemId)
      }
      return prevItems.map((item) => (item.menuItem.id === menuItemId ? { ...item, quantity: newQuantity } : item))
    })
  }, [])

  const removeFromCart = useCallback((menuItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.menuItem.id !== menuItemId))
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  return { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, isHydrated }
}
