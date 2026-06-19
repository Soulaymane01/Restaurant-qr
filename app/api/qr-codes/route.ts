import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snapshot = await adminDb.collection("qrCodes").get()
  const qrCodes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return NextResponse.json(qrCodes)
}

export async function POST(request: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const now = new Date()

  const doc = await adminDb.collection("qrCodes").add({
    tableNumber: body.tableNumber,
    restaurantId: body.restaurantId,
    qrCodeUrl: body.qrCodeUrl || "",
    createdAt: now,
  })

  const qrCode = await doc.get()
  return NextResponse.json({ id: doc.id, ...qrCode.data() })
}
