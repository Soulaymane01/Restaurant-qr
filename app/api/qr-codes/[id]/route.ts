import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = params
  await adminDb.collection("qrCodes").doc(id).delete()
  return NextResponse.json({ success: true })
}
