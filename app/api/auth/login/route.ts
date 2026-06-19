import { NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, createSession } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  if (!checkRateLimit(`login:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  if (email.toLowerCase().trim() === "admin" && password === process.env.ADMIN_PASSWORD) {
    await createSession({ userId: "superadmin", email: "admin", type: "superadmin" })
    return NextResponse.json({ success: true })
  }

  const user = await getUserByEmail(email)
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.password as string)
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  await createSession({ userId: user.id, email: user.email as string, type: "user" })
  return NextResponse.json({ success: true })
}
