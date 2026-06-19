import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { adminStorage } from "@/lib/firebase-admin"
import fs from "fs"
import path from "path"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
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
    const gcsPath = `restaurants/${restaurantId}/${filename}`

    let publicUrl = ""
    try {
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace("firebasestorage.app", "appspot.com")
      const bucket = adminStorage.bucket(bucketName)
      const blob = bucket.file(gcsPath)
      await blob.save(buffer, {
        metadata: { contentType: file.type },
        public: true,
      })
      publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsPath}`
    } catch (error: any) {
      console.warn("Firebase Storage upload failed. Falling back to local upload:", error.message || error)
      
      // Create local directory in public/uploads/[restaurantId]/
      const uploadDir = path.join(process.cwd(), "public", "uploads", restaurantId)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      const filePath = path.join(uploadDir, filename)
      fs.writeFileSync(filePath, buffer)
      
      // Return relative URL that Next.js serves from public directory
      publicUrl = `/uploads/${restaurantId}/${filename}`
    }

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error("Critical error in upload API route:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}
