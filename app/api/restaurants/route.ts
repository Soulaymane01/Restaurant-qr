import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let snapshot
  if (user.type === "superadmin") {
    snapshot = await adminDb.collection("restaurants").get()
  } else {
    snapshot = await adminDb.collection("restaurants").where("userId", "==", user.userId).get()
  }

  const restaurants = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  restaurants.sort((a, b) => {
    const da = a.createdAt?.toDate?.() || new Date(a.createdAt)
    const db = b.createdAt?.toDate?.() || new Date(b.createdAt)
    return db.getTime() - da.getTime()
  })

  return NextResponse.json(restaurants)
}

export async function POST(request: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const now = new Date()

  const doc = await adminDb.collection("restaurants").add({
    name: body.name,
    slug: body.slug,
    description: body.description || "",
    address: body.address || "",
    phone: body.phone || "",
    logo: body.logo || "",
    theme: body.theme || "classic",
    userId: user.type === "superadmin" ? "" : user.userId,
    createdAt: now,
    updatedAt: now,
  })

  const restaurant = await doc.get()
  return NextResponse.json({ id: doc.id, ...restaurant.data() })
}
