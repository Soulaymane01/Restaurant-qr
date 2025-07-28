import { NextResponse } from "next/server"
import { collection, addDoc, getDocs, doc, query, where, getDoc } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import type { QRCode } from "@/lib/types"

// Helper to get Firestore instance (server-side)
const getDb = () => {
  const app = getFirebaseApp()
  if (!app) {
    throw new Error("Firebase app not initialized")
  }
  return getFirestore(app)
}

// Helper to get Auth instance (server-side)
const getFirebaseAuth = () => {
  const app = getFirebaseApp()
  if (!app) {
    throw new Error("Firebase app not initialized")
  }
  return getAuth(app)
}

// Middleware for authentication and authorization (simplified for API routes)
import admin from "firebase-admin"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

// Middleware for authentication and authorization
async function authenticateAndAuthorize(request: Request, allowedRoles: string[]) {
  const db = getDb()
  const idToken = request.headers.get("Authorization")?.split("Bearer ")[1]

  if (!idToken) {
    return { error: "Unauthorized", status: 401 }
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid

    const userDoc = await getDoc(doc(db, "users", uid))
    if (!userDoc.exists()) {
      return { error: "User not found", status: 404 }
    }

    const userData = userDoc.data() as { role: string; approved: boolean; restaurantId?: string }

    if (!userData.approved) {
      return { error: "Account not approved", status: 403 }
    }

    if (!allowedRoles.includes(userData.role)) {
      return { error: "Forbidden: Insufficient role", status: 403 }
    }

    return { uid, role: userData.role, restaurantId: userData.restaurantId }
  } catch (error) {
    console.error("Authentication/Authorization error:", error)
    return { error: "Invalid token or authentication failed", status: 401 }
  }
}

export async function GET(request: Request) {
  const db = getDb()
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get("restaurantId")

  if (!restaurantId) {
    return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
  }

  try {
    const q = query(collection(db, "qrcodes"), where("restaurantId", "==", restaurantId))
    const querySnapshot = await getDocs(q)
    const qrcodes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(qrcodes)
  } catch (error) {
    console.error("Error fetching QR codes:", error)
    return NextResponse.json({ error: "Failed to fetch QR codes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const data: Omit<QRCode, "id" | "createdAt"> = await request.json()

  if (!data.tableNumber || !data.restaurantId || !data.qrCodeUrl) {
    return NextResponse.json({ error: "Table number, restaurant ID, and QR code URL are required" }, { status: 400 })
  }

  if (authResult.restaurantId && authResult.restaurantId !== data.restaurantId) {
    return NextResponse.json({ error: "Forbidden: Cannot create QR code for another restaurant" }, { status: 403 })
  }

  try {
    // Check for existing QR code for the same table number in the same restaurant
    const existingQRCodesQuery = query(
      collection(db, "qrcodes"),
      where("restaurantId", "==", data.restaurantId),
      where("tableNumber", "==", data.tableNumber),
    )
    const existingQRCodesSnapshot = await getDocs(existingQRCodesQuery)

    if (!existingQRCodesSnapshot.empty) {
      return NextResponse.json({ error: `QR code for table ${data.tableNumber} already exists.` }, { status: 409 })
    }

    const newQRCode = {
      ...data,
      createdAt: new Date(),
    }
    const docRef = await addDoc(collection(db, "qrcodes"), newQRCode)
    return NextResponse.json({ id: docRef.id, ...newQRCode }, { status: 201 })
  } catch (error) {
    console.error("Error creating QR code:", error)
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 })
  }
}
