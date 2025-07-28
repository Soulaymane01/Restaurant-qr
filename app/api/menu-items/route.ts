import { NextResponse } from "next/server"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getDoc } from "firebase/firestore"
import type { MenuItem } from "@/lib/types"

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
  const categoryId = searchParams.get("categoryId")

  if (!restaurantId) {
    return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
  }

  try {
    let q = query(collection(db, "menuItems"), where("restaurantId", "==", restaurantId))
    if (categoryId) {
      q = query(q, where("categoryId", "==", categoryId))
    }

    const querySnapshot = await getDocs(q)
    const menuItems = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const data: Omit<MenuItem, "id" | "createdAt" | "updatedAt"> = await request.json()

  if (!data.name || !data.price || !data.categoryId || !data.restaurantId) {
    return NextResponse.json({ error: "Name, price, categoryId, and restaurantId are required" }, { status: 400 })
  }

  if (authResult.restaurantId && authResult.restaurantId !== data.restaurantId) {
    return NextResponse.json({ error: "Forbidden: Cannot create menu item for another restaurant" }, { status: 403 })
  }

  try {
    const newItem = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const docRef = await addDoc(collection(db, "menuItems"), newItem)
    return NextResponse.json({ id: docRef.id, ...newItem }, { status: 201 })
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const data: Partial<MenuItem> = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Menu Item ID is required" }, { status: 400 })
  }

  if (authResult.restaurantId) {
    const itemDoc = await getDoc(doc(db, "menuItems", id))
    if (!itemDoc.exists() || itemDoc.data()?.restaurantId !== authResult.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot update menu item for another restaurant" }, { status: 403 })
    }
  }

  try {
    const itemRef = doc(db, "menuItems", id)
    await updateDoc(itemRef, { ...data, updatedAt: new Date() })
    return NextResponse.json({ message: "Menu item updated successfully" })
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Menu Item ID is required" }, { status: 400 })
  }

  if (authResult.restaurantId) {
    const itemDoc = await getDoc(doc(db, "menuItems", id))
    if (!itemDoc.exists() || itemDoc.data()?.restaurantId !== authResult.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot delete menu item for another restaurant" }, { status: 403 })
    }
  }

  try {
    await deleteDoc(doc(db, "menuItems", id))
    return NextResponse.json({ message: "Menu item deleted successfully" })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}
