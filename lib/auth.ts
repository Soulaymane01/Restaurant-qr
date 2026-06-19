import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { adminDb } from "./firebase-admin"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-jwt-secret-change-in-production")

export interface SessionUser {
  userId: string
  email: string
  type: "user" | "superadmin"
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")
  if (!sessionCookie) return null

  try {
    const { payload } = await jwtVerify(sessionCookie.value, secret)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = cookies()
  cookieStore.delete("session")
}

export async function checkAuth(): Promise<SessionUser | null> {
  return getSession()
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserByEmail(email: string) {
  const snapshot = await adminDb
    .collection("users")
    .where("email", "==", email.toLowerCase().trim())
    .limit(1)
    .get()

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}

export async function createUser(email: string, password: string) {
  const hashed = await hashPassword(password)
  const doc = await adminDb.collection("users").add({
    email: email.toLowerCase().trim(),
    password: hashed,
    createdAt: new Date(),
  })
  return doc.id
}
