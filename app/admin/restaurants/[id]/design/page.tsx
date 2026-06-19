"use client"

import { useParams } from "next/navigation"
import { DesignPicker } from "@/components/admin/design-picker"

export default function DesignPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold">Menu Design</h1><p className="text-sm text-muted-foreground mt-0.5">Mix and match elements to design your menu</p></div>
      <DesignPicker restaurantId={id} />
    </div>
  )
}
