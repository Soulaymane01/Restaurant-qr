import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import type { User } from "@/lib/types"

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authResult = await authenticateAndAuthorize(request, ["admin", "restaurant", "manager"])
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const db = getDb()
  const id = params.id
  const data: Partial<User> = await request.json()

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  // Fetch the user being modified
  const targetUserDoc = await getDoc(doc(db, "users", id))
  if (!targetUserDoc.exists()) {
    return NextResponse.json({ error: "Target user not found" }, { status: 404 })
  }
  const targetUserData = targetUserDoc.data() as User

  // Authorization checks for multi-tenancy and role hierarchy
  if (authResult.role !== "admin") {
    // Non-admins can only modify users within their own restaurant
    if (authResult.restaurantId !== targetUserData.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot modify users from another restaurant" }, { status: 403 })
    }

    // Prevent non-admins from modifying admin roles
    if (targetUserData.role === "admin" && authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Cannot modify an admin user" }, { status: 403 })
    }

    // Restaurant owners cannot change other restaurant owners' roles
    if (authResult.role === "restaurant" && targetUserData.role === "restaurant" && authResult.uid !== id) {
      return NextResponse.json({ error: "Forbidden: Cannot modify another restaurant owner" }, { status: 403 })
    }

    // Managers cannot change restaurant owner roles
    if (authResult.role === "manager" && targetUserData.role === "restaurant") {
      return NextResponse.json({ error: "Forbidden: Manager cannot modify restaurant owner" }, { status: 403 })
    }

    // Users cannot modify their own role if they are not an admin
    if (authResult.uid === id && data.role && data.role !== authResult.role && authResult.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Cannot change your own role unless you are an admin" },
        { status: 403 },
      )
    }

    // Users cannot modify their own approval status
    if (authResult.uid === id && typeof data.approved === "boolean") {
      return NextResponse.json({ error: "Forbidden: Cannot change your own approval status" }, { status: 403 })
    }
  }

  try {
    const userRef = doc(db, "users", id)
    await updateDoc(userRef, { ...data, updatedAt: new Date() })
    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
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
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  // Prevent users from deleting themselves
  if (authResult.uid === id) {
    return NextResponse.json({ error: "Forbidden: Cannot delete your own account" }, { status: 403 })
  }

  // Fetch the user being deleted
  const targetUserDoc = await getDoc(doc(db, "users", id))
  if (!targetUserDoc.exists()) {
    return NextResponse.json({ error: "Target user not found" }, { status: 404 })
  }
  const targetUserData = targetUserDoc.data() as User

  // Authorization checks for multi-tenancy and role hierarchy
  if (authResult.role !== "admin") {
    // Non-admins can only delete users within their own restaurant
    if (authResult.restaurantId !== targetUserData.restaurantId) {
      return NextResponse.json({ error: "Forbidden: Cannot delete users from another restaurant" }, { status: 403 })
    }

    // Prevent non-admins from deleting admin roles
    if (targetUserData.role === "admin") {
      return NextResponse.json({ error: "Forbidden: Cannot delete an admin user" }, { status: 403 })
    }

    // Restaurant owners cannot delete other restaurant owners
    if (authResult.role === "restaurant" && targetUserData.role === "restaurant") {
      return NextResponse.json({ error: "Forbidden: Cannot delete another restaurant owner" }, { status: 403 })
    }

    // Managers cannot delete restaurant owner roles
    if (authResult.role === "manager" && targetUserData.role === "restaurant") {
      return NextResponse.json({ error: "Forbidden: Manager cannot delete restaurant owner" }, { status: 403 })
    }
  }

  try {
    // Also delete the user from Firebase Authentication
    const { deleteUser } = await import("firebase-admin/auth")
    const admin = await import("firebase-admin")

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    }

    await deleteUser(id) // Delete from Firebase Auth
    await deleteDoc(doc(db, "users", id)) // Delete from Firestore

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
