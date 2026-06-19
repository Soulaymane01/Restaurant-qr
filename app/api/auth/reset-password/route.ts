import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  const { token, password } = await request.json()

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password required" }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const snapshot = await adminDb
    .collection("resetTokens")
    .where("token", "==", token)
    .where("used", "==", false)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
  }

  const tokenDoc = snapshot.docs[0]
  const data = tokenDoc.data()

  if (new Date() > data.expiresAt.toDate()) {
    return NextResponse.json({ error: "Reset link has expired" }, { status: 400 })
  }

  const hashed = await hashPassword(password)
  await adminDb.collection("users").doc(data.userId).update({ password: hashed })
  await adminDb.collection("resetTokens").doc(tokenDoc.id).update({ used: true })

  return NextResponse.json({ success: true })
}
