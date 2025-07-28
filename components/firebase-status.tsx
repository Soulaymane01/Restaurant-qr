"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Loader2, XCircle } from "lucide-react"
import { useFirebase } from "@/components/providers/firebase-provider"
import { getMissingEnvVars, isFirebaseConfigValid } from "@/lib/firebase"

type Status = "checking" | "config-missing" | "initializing" | "ready" | "error"

export function FirebaseStatus() {
  const [status, setStatus] = useState<Status>("checking")
  const [missingVars, setMissingVars] = useState<string[]>([])
  const { initialized, error } = useFirebase()

  useEffect(() => {
    const checkStatus = () => {
      // Check configuration first
      if (!isFirebaseConfigValid()) {
        setMissingVars(getMissingEnvVars())
        setStatus("config-missing")
        return
      }

      // If config is valid, check initialization
      if (error) {
        setStatus("error")
      } else if (initialized) {
        setStatus("ready")
      } else {
        setStatus("initializing")
      }
    }

    const timer = setTimeout(checkStatus, 100)
    return () => clearTimeout(timer)
  }, [initialized, error])

  if (status === "ready") {
    return null // Don't show anything when ready
  }

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Checking Firebase configuration...</p>
        </div>
      </div>
    )
  }

  if (status === "config-missing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Firebase Configuration Required</CardTitle>
            </div>
            <CardDescription>Please configure your Firebase environment variables to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Missing environment variables:</p>
                <div className="grid gap-1">
                  {missingVars.map((varName) => (
                    <div key={varName} className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {varName}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Setup Instructions:</h4>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Go to Firebase Console (console.firebase.google.com)</li>
                  <li>2. Create a new project or select existing one</li>
                  <li>3. Enable Authentication with Email/Password</li>
                  <li>4. Create a Firestore database</li>
                  <li>5. Go to Project Settings → General → Your apps</li>
                  <li>6. Copy the config values to your environment variables</li>
                  <li>7. Restart the application</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "initializing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Initializing Firebase services...</p>
          <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <CardTitle>Firebase Initialization Error</CardTitle>
            </div>
            <CardDescription>There was an error initializing Firebase services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Possible solutions:</p>
                <ul className="text-xs space-y-1">
                  <li>• Check your Firebase configuration</li>
                  <li>• Ensure all environment variables are correct</li>
                  <li>• Verify your Firebase project settings</li>
                  <li>• Try refreshing the page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
