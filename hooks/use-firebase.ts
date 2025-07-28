"use client"

import { useState, useEffect, useCallback } from "react"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { getFirebaseApp, isFirebaseConfigValid } from "@/lib/firebase"

interface FirebaseServices {
  auth: Auth | null
  db: Firestore | null
  storage: FirebaseStorage | null
  initialized: boolean
  error: string | null
}

export const useFirebase = (): FirebaseServices => {
  const [services, setServices] = useState<FirebaseServices>({
    auth: null,
    db: null,
    storage: null,
    initialized: false,
    error: null,
  })

  const initializeServices = useCallback(async () => {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      return
    }

    // Check if Firebase config is valid
    if (!isFirebaseConfigValid()) {
      setServices({
        auth: null,
        db: null,
        storage: null,
        initialized: false,
        error: "Firebase configuration is missing or invalid",
      })
      return
    }

    try {
      // Get Firebase app
      const app = getFirebaseApp()

      if (!app) {
        setServices({
          auth: null,
          db: null,
          storage: null,
          initialized: false,
          error: "Failed to initialize Firebase app",
        })
        return
      }

      // Wait a bit to ensure Firebase is fully ready
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Initialize services one by one with error handling
      let auth: Auth | null = null
      let db: Firestore | null = null
      let storage: FirebaseStorage | null = null

      try {
        auth = getAuth(app)
      } catch (error) {
        console.error("Failed to initialize Firebase Auth:", error)
      }

      try {
        db = getFirestore(app)
      } catch (error) {
        console.error("Failed to initialize Firestore:", error)
      }

      try {
        storage = getStorage(app)
      } catch (error) {
        console.error("Failed to initialize Firebase Storage:", error)
      }

      // Check if at least auth and db are available
      if (auth && db) {
        setServices({
          auth,
          db,
          storage,
          initialized: true,
          error: null,
        })
      } else {
        setServices({
          auth: null,
          db: null,
          storage: null,
          initialized: false,
          error: "Failed to initialize required Firebase services",
        })
      }
    } catch (error) {
      console.error("Firebase services initialization error:", error)
      setServices({
        auth: null,
        db: null,
        storage: null,
        initialized: false,
        error: error instanceof Error ? error.message : "Unknown Firebase initialization error",
      })
    }
  }, [])

  useEffect(() => {
    // Delay initialization to ensure proper hydration
    const timer = setTimeout(initializeServices, 1000)
    return () => clearTimeout(timer)
  }, [initializeServices])

  return services
}
