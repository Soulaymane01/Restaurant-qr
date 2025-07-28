"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { FirebaseStatus } from "@/components/firebase-status"
import { useFirebase } from "@/components/providers/firebase-provider"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const { initialized, error } = useFirebase()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (initialized && !loading && !error) {
      setRedirecting(true)
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
    }
  }, [user, loading, initialized, error, router])

  // Show Firebase status if not initialized or has error
  if (!initialized || error) {
    return <FirebaseStatus />
  }

  // Show loading while redirecting
  if (redirecting || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
