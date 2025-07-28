import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Auth,
} from "firebase/auth"
import { doc, setDoc, getDoc, collection, query, where, getDocs, type Firestore } from "firebase/firestore"
import type { User } from "./types"

export const signUp = async (
  auth: Auth,
  db: Firestore,
  email: string,
  password: string,
  name: string,
  role: User["role"] = "restaurant",
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const userData: Omit<User, "id"> = {
      email: firebaseUser.email!,
      name,
      role,
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, "users", firebaseUser.uid), userData)

    return { user: firebaseUser, userData }
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

export const signIn = async (auth: Auth, db: Firestore, email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    if (!userDoc.exists()) {
      throw new Error("User data not found")
    }

    const userData = userDoc.data() as User
    if (!userData.approved) {
      await firebaseSignOut(auth)
      throw new Error("Your account is pending approval. Please contact an administrator.")
    }

    return { user: firebaseUser, userData }
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

export const signOut = async (auth: Auth) => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

export const getUserData = async (uid: string, db: Firestore): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User
    }
    return null
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

export const checkUserRole = (user: User, allowedRoles: User["role"][]): boolean => {
  return allowedRoles.includes(user.role)
}

export const getUsersByRestaurant = async (restaurantId: string, db: Firestore): Promise<User[]> => {
  try {
    const q = query(collection(db, "users"), where("restaurantId", "==", restaurantId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)
  } catch (error) {
    console.error("Error fetching restaurant users:", error)
    return []
  }
}
