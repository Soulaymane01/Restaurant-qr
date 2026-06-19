import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snapshot = await adminDb.collection("categories").get()
  const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const now = new Date()

  const doc = await adminDb.collection("categories").add({
    name: body.name,
    description: body.description || "",
    order: body.order || 0,
    restaurantId: body.restaurantId,
    createdAt: now,
    updatedAt: now,
  })

  const category = await doc.get()
  return NextResponse.json({ id: doc.id, ...category.data() })
}
