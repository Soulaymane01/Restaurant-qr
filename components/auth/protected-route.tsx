"use client"

import type React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { checkUserRole } from "@/lib/auth"
import type { User } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: User["role"][]
  requireApproval?: boolean
}

export function ProtectedRoute({ children, allowedRoles = [], requireApproval = true }: ProtectedRouteProps) {
  const { user, userData, loading, firebaseReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (firebaseReady && !loading) {
      if (!user) {
        router.push("/auth/login")
        return
      }

      if (!userData) {
        router.push("/auth/login")
        return
      }

      if (requireApproval && !userData.approved) {
        router.push("/pending-approval")
        return
      }

      if (allowedRoles.length > 0 && !checkUserRole(userData, allowedRoles)) {
        router.push("/unauthorized")
        return
      }
    }
  }, [user, userData, loading, firebaseReady, router, allowedRoles, requireApproval])

  if (!firebaseReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  if (requireApproval && !userData.approved) {
    return null
  }

  if (allowedRoles.length > 0 && !checkUserRole(userData, allowedRoles)) {
    return null
  }

  return <>{children}</>
}
