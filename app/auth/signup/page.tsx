"use client"

import { SignUpForm } from "@/components/auth/signup-form"
import { FirebaseStatus } from "@/components/firebase-status"
import { useFirebase } from "@/hooks/use-firebase"
import Link from "next/link"

export default function SignUpPage() {
  const { initialized, error } = useFirebase()

  // Show Firebase status if not ready
  if (!initialized || error) {
    return <FirebaseStatus />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join our restaurant management platform</p>
        </div>
        <SignUpForm />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
