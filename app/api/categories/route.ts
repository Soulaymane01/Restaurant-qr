import { NextResponse } from "next/server"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import type { Category } from "@/lib/types"

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

  console.log(restaurantId)

  if (!restaurantId) {
    return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
  }

  try {
    const q = query(collection(db, "categories"), where("restaurantId", "==", restaurantId))
    const querySnapshot = await getDocs(q)
    const categories = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const data: Omit<Category, "id" | "createdAt" | "updatedAt"> = await request.json()

  if (!data.name || !data.restaurantId) {
    return NextResponse.json({ error: "Name and restaurantId are required" }, { status: 400 })
  }

  if (authResult.restaurantId && authResult.restaurantId !== data.restaurantId) {
    return NextResponse.json({ error: "Forbidden: Cannot create category for another restaurant" }, { status: 403 })
  }

  try {
    const newCategory = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const docRef = await addDoc(collection(db, "categories"), newCategory)
    return NextResponse.json({ id: docRef.id, ...newCategory }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
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
  const data: Partial<Category> = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
  }

  if (authResult.restaurantId) {
    const categoryDoc = await getDoc(doc(db, "categories", id))
    if (!categoryDoc.exists() || categoryDoc.data()?.restaurantId !== authResult.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot update category for another restaurant" }, { status: 403 })
    }
  }

  try {
    const categoryRef = doc(db, "categories", id)
    await updateDoc(categoryRef, { ...data, updatedAt: new Date() })
    return NextResponse.json({ message: "Category updated successfully" })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
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
    return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
  }

  if (authResult.restaurantId) {
    const categoryDoc = await getDoc(doc(db, "categories", id))
    if (!categoryDoc.exists() || categoryDoc.data()?.restaurantId !== authResult.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot delete category for another restaurant" }, { status: 403 })
    }
  }

  try {
    await deleteDoc(doc(db, "categories", id))
    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
