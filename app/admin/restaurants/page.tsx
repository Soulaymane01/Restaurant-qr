"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, ExternalLink, Store, Trash2, ChevronRight } from "lucide-react"
import type { Restaurant } from "@/lib/types"

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 50)

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/restaurants")
      if (!res.ok) throw new Error()
      setRestaurants(await res.json())
    } catch { toast.error("Failed to load restaurants") } finally { setLoading(false) }
  }

  useEffect(() => { fetchRestaurants() }, [])

  const handleCreate = async () => {
    if (!newName || !newSlug) return
    setCreating(true)
    try {
      const res = await fetch("/api/restaurants", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug }),
      })
      if (!res.ok) throw new Error()
      toast.success("Restaurant created!")
      setCreateOpen(false); setNewName(""); setNewSlug(""); fetchRestaurants()
    } catch { toast.error("Failed to create restaurant") } finally { setCreating(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/restaurants/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Restaurant deleted"); setDeleteTarget(null); fetchRestaurants()
    } catch { toast.error("Failed to delete restaurant") } finally { setDeleting(false) }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><div className="h-8 w-32 bg-gray-200 rounded animate-pulse" /><div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" /></div>
          <div className="h-11 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-5"><div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
              </div></div>
              <div className="flex border-t bg-slate-50/50 px-4 py-3 gap-6">
                <Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Restaurants</h1><p className="text-sm text-muted-foreground mt-0.5">Manage the restaurants in your system</p></div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button size="lg" className="gap-2"><Plus className="h-5 w-5" />Add Restaurant</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-xl">New Restaurant</DialogTitle><p className="text-sm text-muted-foreground">Enter the restaurant name. The menu URL will be created automatically.</p></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label htmlFor="name">Restaurant Name</Label>
                <Input id="name" value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(generateSlug(e.target.value)) }} placeholder="e.g. La Maison" className="text-base" autoFocus /></div>
              {newSlug && <div className="rounded-lg bg-muted px-4 py-3 text-sm"><p className="text-xs text-muted-foreground mb-1">Menu URL:</p><p className="font-mono text-foreground">{window.location.origin}/menu/{newSlug}/1</p></div>}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating || !newName || !newSlug} size="lg">{creating ? "Creating..." : "Create Restaurant"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 mb-4"><Store className="h-8 w-8 text-primary/40" /></div>
          <h2 className="text-lg font-semibold mb-1">No restaurants yet</h2>
          <p className="text-sm text-muted-foreground mb-5">Add your first restaurant to get started</p>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="gap-2"><Plus className="h-5 w-5" />Add Your First Restaurant</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {restaurants.map((r) => (
            <div key={r.id} className="group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => router.push(`/admin/restaurants/${r.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 shrink-0"><Store className="h-6 w-6 text-primary/60" /></div>
                    <div><h3 className="font-semibold text-base">{r.name}</h3><p className="text-xs text-muted-foreground mt-0.5">/{r.slug}</p></div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                </div>
              </div>
              <div className="flex border-t bg-slate-50/50">
                <button onClick={() => router.push(`/admin/restaurants/${r.id}/menu`)} className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white transition-colors border-r">Menu</button>
                <button onClick={(e) => { e.stopPropagation(); window.open(`/menu/${r.slug}/1`, "_blank") }} className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white transition-colors border-r"><ExternalLink className="h-4 w-4 inline mr-1" />Preview</button>
                <button onClick={() => setDeleteTarget(r)} className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-white transition-colors"><Trash2 className="h-4 w-4 inline mr-1" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">{restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} total</p>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete restaurant?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete <strong>{deleteTarget?.name}</strong> and all its categories, menu items, QR codes, and uploaded images. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">{deleting ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
