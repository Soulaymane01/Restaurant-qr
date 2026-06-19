"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import type { Category, MenuItem } from "@/lib/types"

interface Props { restaurantId: string }

export function MenuEditor({ restaurantId }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null)
  const [deleteItemTarget, setDeleteItemTarget] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [catForm, setCatForm] = useState({ name: "", description: "" })
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "", categoryId: "none", imageUrl: "", available: true })

  const fetchData = useCallback(async () => {
    try {
      const catSnapshot = await getDocs(query(collection(db, "categories"), where("restaurantId", "==", restaurantId)))
      const cats = catSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category)).sort((a, b) => a.order - b.order)
      setCategories(cats)
      const itemSnapshot = await getDocs(query(collection(db, "menuItems"), where("restaurantId", "==", restaurantId)))
      const menuItems = itemSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem)).sort((a, b) => a.order - b.order)
      setItems(menuItems)
    } catch { toast.error("Failed to load menu data") } finally { setLoading(false) }
  }, [restaurantId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("restaurantId", restaurantId)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setItemForm({ ...itemForm, imageUrl: data.url })
      toast.success("Image uploaded")
    } catch { toast.error("Failed to upload image") } finally { setUploading(false) }
  }

  const createCategory = async () => {
    if (!catForm.name) return
    try {
      const res = await fetch("/api/categories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...catForm, restaurantId, order: categories.length }),
      })
      if (!res.ok) throw new Error()
      toast.success("Category created")
      setCatForm({ name: "", description: "" }); setCatDialogOpen(false); fetchData()
    } catch { toast.error("Failed to create category") }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${deleteCatTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Category deleted"); setDeleteCatTarget(null); fetchData()
    } catch { toast.error("Failed to delete category") } finally { setDeleting(false) }
  }

  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({ name: item.name, description: item.description, price: item.price.toString(), categoryId: item.categoryId || "none", imageUrl: item.imageUrl || "", available: item.available })
    } else {
      setEditingItem(null)
      setItemForm({ name: "", description: "", price: "", categoryId: "none", imageUrl: "", available: true })
    }
    setItemDialogOpen(true)
  }

  const saveItem = async () => {
    if (!itemForm.name || !itemForm.price) return
    try {
      const body = { ...itemForm, categoryId: itemForm.categoryId === "none" ? "" : itemForm.categoryId, restaurantId }
      let res
      if (editingItem) {
        res = await fetch(`/api/menu-items/${editingItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      } else {
        res = await fetch("/api/menu-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, order: items.length }) })
      }
      if (!res.ok) throw new Error()
      toast.success(editingItem ? "Item updated" : "Item created"); setItemDialogOpen(false); fetchData()
    } catch { toast.error("Failed to save item") }
  }

  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/menu-items/${deleteItemTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Item deleted"); setDeleteItemTarget(null); fetchData()
    } catch { toast.error("Failed to delete item") } finally { setDeleting(false) }
  }

  if (loading) {
    return <div className="space-y-4">
      <div className="flex justify-end"><Skeleton className="h-10 w-32 rounded-lg" /></div>
      <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="flex items-center gap-4 p-3 rounded-lg border"><Skeleton className="h-10 w-10 rounded" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-16 rounded" /></div>)}</div>
    </div>
  }

  return (
    <>
      <Tabs defaultValue="items">
        <TabsList><TabsTrigger value="items">Menu Items</TabsTrigger><TabsTrigger value="categories">Categories</TabsTrigger></TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
              <DialogTrigger asChild><Button onClick={() => openItemDialog()}><Plus className="h-4 w-4 mr-2" />Add Item</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{editingItem ? "Edit Item" : "New Menu Item"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Item name" /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Price (MAD)</Label><Input type="number" step="0.01" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="0.00" /></div>
                    <div className="space-y-2"><Label>Category</Label>
                      <Select value={itemForm.categoryId} onValueChange={(v) => setItemForm({ ...itemForm, categoryId: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                    {itemForm.imageUrl && <img src={itemForm.imageUrl} alt="Preview" className="h-20 w-20 object-contain rounded bg-muted" onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none" }} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={itemForm.available} onCheckedChange={(v) => setItemForm({ ...itemForm, available: v })} id="available" />
                    <Label htmlFor="available">Available</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveItem} disabled={!itemForm.name || !itemForm.price || uploading}>{uploading ? "Uploading..." : editingItem ? "Save" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {items.length === 0 ? <p className="text-center text-muted-foreground py-8">No menu items yet</p> : (
            <Table>
              <TableHeader><TableRow><TableHead className="w-12"></TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Available</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-contain bg-muted" onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none" }} /> : <div className="h-10 w-10 rounded bg-muted" />}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{categories.find((c) => c.id === item.categoryId)?.name || "—"}</TableCell>
                    <TableCell>{item.price.toFixed(2)} MAD</TableCell>
                    <TableCell><span className={`text-sm ${item.available ? "text-green-600" : "text-red-500"}`}>{item.available ? "Yes" : "No"}</span></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openItemDialog(item)}><Edit2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteItemTarget(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Category</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Starters, Main Course" /></div>
                  <div className="space-y-2"><Label>Description (optional)</Label><Input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button><Button onClick={createCategory} disabled={!catForm.name}>Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {categories.length === 0 ? <p className="text-center text-muted-foreground py-8">No categories yet</p> : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div><p className="font-medium">{cat.name}</p>{cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteCatTarget(cat)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteCatTarget} onOpenChange={(o) => { if (!o) setDeleteCatTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>Delete &ldquo;{deleteCatTarget?.name}&rdquo;? Items in it won&apos;t be deleted.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} disabled={deleting} className="bg-destructive hover:bg-destructive/90">{deleting ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteItemTarget} onOpenChange={(o) => { if (!o) setDeleteItemTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete menu item?</AlertDialogTitle>
            <AlertDialogDescription>Delete &ldquo;{deleteItemTarget?.name}&rdquo; from the menu?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} disabled={deleting} className="bg-destructive hover:bg-destructive/90">{deleting ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
