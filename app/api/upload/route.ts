import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminStorage } from "@/lib/firebase-admin"

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

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split(".").pop() || "jpg"
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const path = `restaurants/${restaurantId}/${filename}`

  const bucket = adminStorage.bucket()
  const blob = bucket.file(path)
  await blob.save(buffer, {
    metadata: { contentType: file.type },
    public: true,
  })

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`

  return NextResponse.json({ url: publicUrl })
}
