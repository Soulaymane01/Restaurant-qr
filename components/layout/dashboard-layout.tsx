"use client"

import type React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/hooks/use-firebase"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Menu, ShoppingCart, QrCode, Users, LogOut, MenuIcon as Restaurant } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { userData } = useAuth()
  const { auth } = useFirebase()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth)
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "restaurant", "manager"],
    },
    {
      name: "Menu Management",
      href: "/dashboard/menu",
      icon: Menu,
      roles: ["admin", "restaurant", "manager"],
    },
    {
      name: "Order Management",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      roles: ["admin", "restaurant", "manager", "worker"],
    },
    {
      name: "QR Codes",
      href: "/dashboard/qr-codes",
      icon: QrCode,
      roles: ["admin", "restaurant", "manager"],
    },
    {
      name: "User Management",
      href: "/dashboard/users",
      icon: Users,
      roles: ["admin", "restaurant", "manager"],
    },
    {
      name: "Restaurant Settings",
      href: "/dashboard/restaurant",
      icon: Restaurant,
      roles: ["admin", "restaurant"],
    },
  ]

  const allowedItems = navigationItems.filter((item) => userData && item.roles.includes(userData.role))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Restaurant Manager</h1>
            <p className="text-sm text-gray-500 mt-1">
              {userData?.name} ({userData?.role})
            </p>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              {allowedItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 mb-1"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 w-64 p-4">
            <Button onClick={handleSignOut} variant="outline" className="w-full justify-start bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
