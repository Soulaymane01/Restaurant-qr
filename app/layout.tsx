import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FirebaseProvider } from "@/components/providers/firebase-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ClientWrapper } from "@/components/client-wrapper"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurant Management System",
  description: "Secure multi-tenant restaurant management platform",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <ClientWrapper>
            <FirebaseProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </FirebaseProvider>
          </ClientWrapper>
        </Suspense>
      </body>
    </html>
  )
}