"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
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
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/components/providers/firebase-provider"
import type { Category } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export function MenuCategories() {
  const { userData, user } = useAuth() // Added user
  const { db, initialized } = useFirebase()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const { toast } = useToast()

  const fetchCategories = async () => {
    if (!initialized || !db || !userData?.restaurantId || !user) return // Added !user

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/categories?restaurantId=${userData.restaurantId}`, {
        headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
      })
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.sort((a: Category, b: Category) => a.order - b.order))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load categories.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized && db && userData?.restaurantId && user) {
      // Added user
      fetchCategories()
    }
  }, [initialized, db, userData?.restaurantId, user]) // Added user to dependencies

  const handleCreateCategory = () => {
    setIsEditing(false)
    setCurrentCategory({ name: "", description: "", order: categories.length + 1 })
    setDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setIsEditing(true)
    setCurrentCategory({ ...category })
    setDialogOpen(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!db || !userData?.restaurantId || !user) return // Added !user

    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/categories/${id}?restaurantId=${userData.restaurantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
      })
      if (!response.ok) throw new Error("Failed to delete category")
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !userData?.restaurantId || !currentCategory?.name || !user) {
      // Added !user
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      })
      return
    }

    setFormLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const payload = {
        ...currentCategory,
        restaurantId: userData.restaurantId,
        order: currentCategory.order || categories.length + 1,
      }

      let response
      if (isEditing && currentCategory?.id) {
        response = await fetch(`/api/categories/${currentCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, // Add Authorization header
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, // Add Authorization header
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) throw new Error(`Failed to ${isEditing ? "update" : "create"} category`)

      toast({
        title: "Success",
        description: `Category ${isEditing ? "updated" : "created"} successfully.`,
      })
      setDialogOpen(false)
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} category.`,
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
          You need to be associated with a restaurant to manage categories.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Menu Categories</CardTitle>
        <Button onClick={handleCreateCategory}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground">No categories found. Start by adding a new one!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                  <TableCell>{category.order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
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
            <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Make changes to your category here." : "Add a new category to your menu."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={currentCategory?.name || ""}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  required
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={currentCategory?.description || ""}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={currentCategory?.order || ""}
                  onChange={(e) =>
                    setCurrentCategory({ ...currentCategory, order: Number.parseInt(e.target.value) || 0 })
                  }
                  disabled={formLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
