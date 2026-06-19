import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import crypto from "crypto"

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const snapshot = await adminDb
    .collection("users")
    .where("email", "==", email.toLowerCase().trim())
    .limit(1)
    .get()

  if (snapshot.empty) {
    return NextResponse.json({ success: true })
  }

  const user = snapshot.docs[0]
  const token = crypto.randomBytes(32).toString("hex")

  await adminDb.collection("resetTokens").add({
    userId: user.id,
    email: email.toLowerCase().trim(),
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    used: false,
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

  return NextResponse.json({ success: true, resetUrl })
}
