import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = params
  const body = await request.json()
  
  const updateData: any = { ...body, updatedAt: new Date() }
  if (body.price !== undefined) {
    updateData.price = parseFloat(body.price) || 0
  }

  await adminDb.collection("menuItems").doc(id).update(updateData)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = params
  await adminDb.collection("menuItems").doc(id).delete()
  return NextResponse.json({ success: true })
}
