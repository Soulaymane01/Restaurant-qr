import { NextResponse } from "next/server"
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import type { Restaurant } from "@/lib/types"

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
  const authResult = await authenticateAndAuthorize(request, ["admin"]) // Only admin can list all restaurants
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()

  try {
    const querySnapshot = await getDocs(collection(db, "restaurants"))
    const restaurants = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(restaurants)
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const data: Omit<Restaurant, "createdAt" | "updatedAt"> = await request.json()

  if (!data.id || !data.name || !data.address || !data.phone || !data.email || !data.ownerId) {
    return NextResponse.json({ error: "ID, Name, address, phone, email, and ownerId are required" }, { status: 400 })
  }

  // Ensure restaurant owner can only create their own restaurant
  if (authResult.role === "restaurant" && authResult.uid !== data.ownerId) {
    return NextResponse.json(
      { error: "Forbidden: Restaurant owner can only create their own restaurant" },
      { status: 403 },
    )
  }

  // Ensure the restaurant ID matches the user's restaurantId
  if (authResult.restaurantId && authResult.restaurantId !== data.id) {
    return NextResponse.json(
      { error: "Forbidden: Restaurant ID must match user's assigned restaurant ID" },
      { status: 403 },
    )
  }

  try {
    // Use setDoc with the provided ID to create/overwrite the document
    const newRestaurant = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await setDoc(doc(db, "restaurants", data.id), newRestaurant)

    // Also update the user's document to set their restaurantId if it's not already set
    const userRef = doc(db, "users", authResult.uid)
    await updateDoc(userRef, { restaurantId: data.id, updatedAt: new Date() })

    return NextResponse.json({ id: data.id, ...newRestaurant }, { status: 201 })
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 })
  }
}
