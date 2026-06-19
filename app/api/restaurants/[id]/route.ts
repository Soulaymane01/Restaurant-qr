import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"
import { rm } from "fs/promises"
import path from "path"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = params
  const doc = await adminDb.collection("restaurants").doc(id).get()
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ id: doc.id, ...doc.data() })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = params
  const body = await request.json()

  await adminDb.collection("restaurants").doc(id).update({ ...body, updatedAt: new Date() })
  const doc = await adminDb.collection("restaurants").doc(id).get()
  return NextResponse.json({ id: doc.id, ...doc.data() })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = params

  const [catSnapshot, itemSnapshot, qrSnapshot] = await Promise.all([
    adminDb.collection("categories").where("restaurantId", "==", id).get(),
    adminDb.collection("menuItems").where("restaurantId", "==", id).get(),
    adminDb.collection("qrCodes").where("restaurantId", "==", id).get(),
  ])

  const batch = adminDb.batch()
  catSnapshot.docs.forEach((d) => batch.delete(d.ref))
  itemSnapshot.docs.forEach((d) => batch.delete(d.ref))
  qrSnapshot.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(adminDb.collection("restaurants").doc(id))
  await batch.commit()

  const uploadDir = path.join(process.cwd(), "public", "uploads", id)
  try { await rm(uploadDir, { recursive: true, force: true }) } catch {}

  return NextResponse.json({ success: true })
}
