"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { UtensilsCrossed, Palette, QrCode, ArrowLeft } from "lucide-react"
import type { Restaurant } from "@/lib/types"

export default function RestaurantSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/restaurants/${id}`).then((r) => r.json()).then((data) => {
      setRestaurant(data)
      setName(data.name || "")
      setDescription(data.description || "")
      setAddress(data.address || "")
      setPhone(data.phone || "")
    }).catch(() => toast.error("Failed to load restaurant"))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, address, phone }),
      })
      if (!res.ok) throw new Error()
      toast.success("Settings saved")
    } catch { toast.error("Failed to save") } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/restaurants")}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-xl font-bold">{restaurant?.name || "Settings"}</h1><p className="text-sm text-muted-foreground">Restaurant settings</p></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/admin/restaurants/${id}/menu`)}>
          <UtensilsCrossed className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold">Menu</h3>
          <p className="text-sm text-muted-foreground">Manage categories and items</p>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/admin/restaurants/${id}/design`)}>
          <Palette className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold">Design</h3>
          <p className="text-sm text-muted-foreground">Customize menu appearance</p>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/admin/restaurants/${id}/qr-codes`)}>
          <QrCode className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold">QR Codes</h3>
          <p className="text-sm text-muted-foreground">Generate table QR codes</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Details</h3>
        <div className="grid gap-4 max-w-md">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-2"><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <Button onClick={handleSave} disabled={saving} className="w-fit">{saving ? "Saving..." : "Save"}</Button>
        </div>
      </Card>
    </div>
  )
}
