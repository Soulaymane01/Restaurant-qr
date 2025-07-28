"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Loader2, ImageIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/components/providers/firebase-provider"
import type { MenuItem, Category } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export function MenuItems() {
  const { userData, user } = useAuth() // Added user
  const { db, initialized, storage } = useFirebase()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentMenuItem, setCurrentMenuItem] = useState<Partial<MenuItem> | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const { toast } = useToast()

  const fetchMenuItemsAndCategories = async () => {
    if (!initialized || !db || !userData?.restaurantId || !user) return // Added !user

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const [itemsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/menu-items?restaurantId=${userData.restaurantId}`, {
          headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
        }),
        fetch(`/api/categories?restaurantId=${userData.restaurantId}`, {
          headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
        }),
      ])

      if (!itemsResponse.ok) throw new Error("Failed to fetch menu items")
      if (!categoriesResponse.ok) throw new Error("Failed to fetch categories")

      const itemsData = await itemsResponse.json()
      const categoriesData = await categoriesResponse.json()

      setMenuItems(itemsData.sort((a: MenuItem, b: MenuItem) => a.order - b.order))
      setCategories(categoriesData.sort((a: Category, b: Category) => a.order - b.order))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load menu data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized && db && userData?.restaurantId && user) {
      // Added user
      fetchMenuItemsAndCategories()
    }
  }, [initialized, db, userData?.restaurantId, user]) // Added user to dependencies

  const handleCreateMenuItem = () => {
    setIsEditing(false)
    setCurrentMenuItem({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      imageUrl: "",
      available: true,
      order: menuItems.length + 1,
    })
    setImageFile(null)
    setDialogOpen(true)
  }

  const handleEditMenuItem = (item: MenuItem) => {
    setIsEditing(true)
    setCurrentMenuItem({ ...item })
    setImageFile(null)
    setDialogOpen(true)
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!db || !userData?.restaurantId || !user) return // Added !user

    if (!window.confirm("Are you sure you want to delete this menu item? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/menu-items/${id}?restaurantId=${userData.restaurantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
      })
      if (!response.ok) throw new Error("Failed to delete menu item")
      toast({
        title: "Success",
        description: "Menu item deleted successfully.",
      })
      fetchMenuItemsAndCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleImageUpload = async (): Promise<string | undefined> => {
    if (!imageFile || !storage || !userData?.restaurantId || !user) return currentMenuItem?.imageUrl // Added !user

    setFormLoading(true)
    try {
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")
      const storageRef = ref(storage, `menu-items/${userData.restaurantId}/${imageFile.name}-${Date.now()}`)
      await uploadBytes(storageRef, imageFile)
      const downloadURL = await getDownloadURL(storageRef)
      toast({
        title: "Image Uploaded",
        description: "Image uploaded successfully.",
      })
      return downloadURL
    } catch (error: any) {
      toast({
        title: "Image Upload Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      })
      return undefined
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !db ||
      !userData?.restaurantId ||
      !currentMenuItem?.name ||
      !currentMenuItem?.price ||
      !currentMenuItem?.categoryId ||
      !user // Added !user
    ) {
      toast({
        title: "Validation Error",
        description: "Name, price, and category are required.",
        variant: "destructive",
      })
      return
    }

    setFormLoading(true)
    try {
      let imageUrl = currentMenuItem.imageUrl
      if (imageFile) {
        imageUrl = await handleImageUpload()
        if (imageUrl === undefined) {
          throw new Error("Image upload failed, cannot save menu item.")
        }
      }

      const idToken = await user.getIdToken() // Get ID token
      const payload = {
        ...currentMenuItem,
        restaurantId: userData.restaurantId,
        imageUrl: imageUrl || null,
        order: currentMenuItem.order || menuItems.length + 1,
      }

      let response
      if (isEditing && currentMenuItem?.id) {
        response = await fetch(`/api/menu-items/${currentMenuItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, // Add Authorization header
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch("/api/menu-items", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, // Add Authorization header
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) throw new Error(`Failed to ${isEditing ? "update" : "create"} menu item`)

      toast({
        title: "Success",
        description: `Menu item ${isEditing ? "updated" : "created"} successfully.`,
      })
      setDialogOpen(false)
      fetchMenuItemsAndCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} menu item.`,
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
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
          You need to be associated with a restaurant to manage menu items.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Menu Items</CardTitle>
        <Button onClick={handleCreateMenuItem}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </CardHeader>
      <CardContent>
        {menuItems.length === 0 ? (
          <p className="text-center text-muted-foreground">No menu items found. Start by adding a new one!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {categories.find((cat) => cat.id === item.categoryId)?.name || "N/A"}
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.available ? "Yes" : "No"}</TableCell>
                  <TableCell>{item.order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditMenuItem(item)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMenuItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Make changes to your menu item here." : "Add a new item to your menu."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={currentMenuItem?.name || ""}
                  onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, name: e.target.value })}
                  required
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentMenuItem?.description || ""}
                  onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, description: e.target.value })}
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={currentMenuItem?.price || ""}
                  onChange={(e) =>
                    setCurrentMenuItem({ ...currentMenuItem, price: Number.parseFloat(e.target.value) || 0 })
                  }
                  required
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={currentMenuItem?.categoryId || ""}
                  onValueChange={(value) => setCurrentMenuItem({ ...currentMenuItem, categoryId: value })}
                  disabled={formLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  disabled={formLoading}
                />
                {currentMenuItem?.imageUrl && !imageFile && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>
                      Current image:{" "}
                      <a
                        href={currentMenuItem.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View
                      </a>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={currentMenuItem?.available || false}
                  onCheckedChange={(checked) => setCurrentMenuItem({ ...currentMenuItem, available: Boolean(checked) })}
                  disabled={formLoading}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={currentMenuItem?.order || ""}
                  onChange={(e) =>
                    setCurrentMenuItem({ ...currentMenuItem, order: Number.parseInt(e.target.value) || 0 })
                  }
                  disabled={formLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
