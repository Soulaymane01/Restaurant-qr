import { NextResponse } from "next/server"
import { createUser, getUserByEmail, createSession } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  if (!checkRateLimit(`signup:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  const existing = await getUserByEmail(email)
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const userId = await createUser(email, password)
  await createSession({ userId, email: email.toLowerCase().trim(), type: "user" })

  return NextResponse.json({ success: true })
}
