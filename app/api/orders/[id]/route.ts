import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import type { Order } from "@/lib/types"

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = getDb()
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
  }

  try {
    const docRef = doc(db, "orders", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager", "worker"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const id = params.id
  const data: Partial<Order> = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
  }

  if (authResult.restaurantId) {
    const orderDoc = await getDoc(doc(db, "orders", id))
    if (!orderDoc.exists() || orderDoc.data()?.restaurantId !== authResult.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot update order for another restaurant" }, { status: 403 })
    }
  }

  try {
    const orderRef = doc(db, "orders", id)
    await updateDoc(orderRef, { ...data, updatedAt: new Date() })
    return NextResponse.json({ message: "Order updated successfully" })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
  }

  if (authResult.restaurantId) {
    const orderDoc = await getDoc(doc(db, "orders", id))
    if (!orderDoc.exists() || orderDoc.data()?.restaurantId !== authResult.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot delete order for another restaurant" }, { status: 403 })
    }
  }

  try {
    await deleteDoc(doc(db, "orders", id))
    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
