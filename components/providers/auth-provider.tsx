"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth"
import { useFirebase } from "./firebase-provider"
import { getUserData } from "@/lib/auth"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: FirebaseUser | null
  userData: User | null
  loading: boolean
  firebaseReady: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  firebaseReady: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { auth, db, initialized, error } = useFirebase()

  useEffect(() => {
    // Don't set up auth listener if Firebase isn't ready or has errors
    if (!initialized || error || !auth || !db) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          setUser(firebaseUser)

          if (firebaseUser) {
            const data = await getUserData(firebaseUser.uid, db)
            setUserData(data)
          } else {
            setUserData(null)
          }
        } catch (error) {
          console.error("Error in auth state change:", error)
          setUserData(null)
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error("Auth state change error:", error)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [auth, db, initialized, error])

  return (
    <AuthContext.Provider value={{ user, userData, loading, firebaseReady: initialized && !error }}>
      {children}
    </AuthContext.Provider>
  )
}
