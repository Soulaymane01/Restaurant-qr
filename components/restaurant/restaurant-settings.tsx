"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/components/providers/firebase-provider"
import type { Restaurant } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export function RestaurantSettings() {
  const { userData, user, loading: authLoading } = useAuth()
  const { db, initialized, error: firebaseError } = useFirebase()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  })
  const { toast } = useToast()

  const fetchRestaurantDetails = async () => {
    if (!initialized || !db || !userData?.restaurantId || !user) {
      // Added !user
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/restaurants/${userData.restaurantId}`, {
        headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
      })
      if (!response.ok) {
        if (response.status === 404) {
          // Restaurant not found, means it needs to be created
          setRestaurant(null)
          setFormData({
            name: "",
            description: "",
            address: "",
            phone: "",
            email: userData.email || "",
          })
        } else {
          throw new Error("Failed to fetch restaurant details")
        }
      } else {
        const data = await response.json()
        setRestaurant(data)
        setFormData(data)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load restaurant details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized && !authLoading && !firebaseError && userData?.restaurantId && user) {
      // Added user
      fetchRestaurantDetails()
    }
  }, [initialized, authLoading, firebaseError, userData?.restaurantId, user]) // Added user to dependencies

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !userData?.restaurantId || !user) return

    setFormLoading(true)
    try {
      let response

      if (restaurant) {
        // Update existing restaurant
        response = await fetch(`/api/restaurants/${restaurant.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new restaurant
        const payload = {
          ...formData,
          ownerId: user.uid,
          id: userData.restaurantId, // Use the user's restaurantId as the document ID
        }
        response = await fetch("/api/restaurants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${restaurant ? "update" : "create"} restaurant.`)
      }

      toast({
        title: "Success",
        description: `Restaurant details ${restaurant ? "updated" : "created"} successfully.`,
      })
      fetchRestaurantDetails() // Re-fetch to ensure data is fresh
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${restaurant ? "update" : "create"} restaurant.`,
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  if (loading || authLoading) {
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
          Your account is not associated with a restaurant. Please contact an administrator.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{restaurant ? "Edit Restaurant Details" : "Create Your Restaurant Profile"}</CardTitle>
        <CardDescription>
          {restaurant
            ? "Update your restaurant's information."
            : "Your restaurant profile is not set up yet. Please provide the details below."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input id="name" value={formData.name || ""} onChange={handleChange} required disabled={formLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
                disabled={formLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="A brief description of your restaurant."
              disabled={formLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={handleChange}
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleChange}
                required
                disabled={formLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={formLoading}>
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {restaurant ? "Save Changes" : "Create Restaurant Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
