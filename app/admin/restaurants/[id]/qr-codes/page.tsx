"use client"

import { useParams } from "next/navigation"
import { QRCodeGenerator } from "@/components/admin/qr-code-generator"

export default function QRCodesPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold">QR Codes</h1><p className="text-sm text-muted-foreground mt-0.5">Generate QR codes for your tables</p></div>
      <QRCodeGenerator restaurantId={id} />
    </div>
  )
}
