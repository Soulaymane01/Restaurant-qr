import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { put } from "@vercel/blob"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File
  const restaurantId = formData.get("restaurantId") as string

  if (!file || !restaurantId) {
    return NextResponse.json({ error: "Missing file or restaurantId" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, and GIF images are allowed" }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "jpg"
  const filename = `restaurants/${restaurantId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

  const blob = await put(filename, file, { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN })

  return NextResponse.json({ url: blob.url })
}
