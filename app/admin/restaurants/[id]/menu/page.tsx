"use client"

import { useParams } from "next/navigation"
import { MenuEditor } from "@/components/admin/menu-editor"

export default function MenuPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold">Menu</h1><p className="text-sm text-muted-foreground mt-0.5">Add categories and menu items</p></div>
      <MenuEditor restaurantId={id} />
    </div>
  )
}
