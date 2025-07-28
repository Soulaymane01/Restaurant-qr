"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function FirebaseCheck() {
  const [firebaseStatus, setFirebaseStatus] = useState<"checking" | "configured" | "missing">("checking")
  const [missingVars, setMissingVars] = useState<string[]>([])

  useEffect(() => {
    const requiredVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const missing = requiredVars.filter((varName) => !process.env[varName])

    if (missing.length > 0) {
      setMissingVars(missing)
      setFirebaseStatus("missing")
    } else {
      setFirebaseStatus("configured")
    }
  }, [])

  if (firebaseStatus === "checking") {
    return null
  }

  if (firebaseStatus === "missing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Firebase Configuration Missing</CardTitle>
            </div>
            <CardDescription>Please configure your Firebase environment variables to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Missing environment variables:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {missingVars.map((varName) => (
                  <li key={varName} className="font-mono">
                    {varName}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600">
                  Add these variables to your environment configuration and restart the application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
