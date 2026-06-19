import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snapshot = await adminDb.collection("menuItems").get()
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const now = new Date()

  const doc = await adminDb.collection("menuItems").add({
    name: body.name,
    description: body.description || "",
    price: parseFloat(body.price) || 0,
    categoryId: body.categoryId || "",
    restaurantId: body.restaurantId,
    imageUrl: body.imageUrl || "",
    available: body.available !== false,
    order: body.order || 0,
    createdAt: now,
    updatedAt: now,
  })

  const item = await doc.get()
  return NextResponse.json({ id: doc.id, ...item.data() })
}
