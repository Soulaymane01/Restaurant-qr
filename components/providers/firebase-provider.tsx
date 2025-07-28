"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { firebaseConfig, isFirebaseConfigValid } from "@/lib/firebase"

interface FirebaseContextType {
  app: FirebaseApp | null
  auth: Auth | null
  db: Firestore | null
  storage: FirebaseStorage | null
  initialized: boolean
  error: string | null
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  storage: null,
  initialized: false,
  error: null,
})

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseState, setFirebaseState] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
    storage: null,
    initialized: false,
    error: null,
  })

  useEffect(() => {
    const initializeFirebase = async () => {
      // Only run on client side
      if (typeof window === "undefined") {
        return
      }

      // Check if config is valid
      if (!isFirebaseConfigValid()) {
        setFirebaseState({
          app: null,
          auth: null,
          db: null,
          storage: null,
          initialized: false,
          error: "Firebase configuration is missing or invalid",
        })
        return
      }

      try {
        // Initialize Firebase app
        let app: FirebaseApp
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig)
        } else {
          app = getApp()
        }

        // Wait for app to be fully initialized
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Initialize services
        const auth = getAuth(app)
        const db = getFirestore(app)
        const storage = getStorage(app)

        // Wait a bit more to ensure services are ready
        await new Promise((resolve) => setTimeout(resolve, 500))

        setFirebaseState({
          app,
          auth,
          db,
          storage,
          initialized: true,
          error: null,
        })
      } catch (error) {
        console.error("Firebase initialization error:", error)
        setFirebaseState({
          app: null,
          auth: null,
          db: null,
          storage: null,
          initialized: false,
          error: error instanceof Error ? error.message : "Unknown Firebase initialization error",
        })
      }
    }

    // Delay initialization to ensure proper hydration
    const timer = setTimeout(initializeFirebase, 2000)
    return () => clearTimeout(timer)
  }, [])

  return <FirebaseContext.Provider value={firebaseState}>{children}</FirebaseContext.Provider>
}
