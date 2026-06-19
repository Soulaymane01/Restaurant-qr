"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Store, LogOut, Menu, QrCode, Palette, UtensilsCrossed, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [{ href: "/admin/restaurants", label: "Restaurants", icon: Store }]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/admin") return
    fetch("/api/auth/me").then(async (res) => {
      if (!res.ok) { router.push("/login"); return }
      const data = await res.json()
      setUserEmail(data.email)
      setAuthenticated(true)
    })
  }, [pathname, router])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  if (pathname === "/admin") return <>{children}</>

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const restaurantId = pathname.match(/\/admin\/restaurants\/([^/]+)/)?.[1]
  const section = pathname.includes("/menu") ? "menu" :
    pathname.includes("/design") ? "design" :
    pathname.includes("/qr-codes") ? "qr" :
    pathname.match(/\/admin\/restaurants\/([^/]+)$/) ? "settings" : null

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/admin/restaurants" className="flex items-center gap-2.5 font-semibold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <QrCode className="h-4 w-4" />
              </div>
              <span>RestaurantQR</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className={`${sidebarOpen ? "block" : "hidden"} md:block w-56 border-r bg-white min-h-[calc(100vh-3.5rem)]`}>
          <nav className="p-3 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.includes(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              )
            })}
            {restaurantId && (
              <>
                <p className="px-3 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant</p>
                {[
                  { href: `/admin/restaurants/${restaurantId}`, label: "Settings", icon: Settings, match: "settings" },
                  { href: `/admin/restaurants/${restaurantId}/menu`, label: "Menu", icon: UtensilsCrossed, match: "menu" },
                  { href: `/admin/restaurants/${restaurantId}/design`, label: "Design", icon: Palette, match: "design" },
                  { href: `/admin/restaurants/${restaurantId}/qr-codes`, label: "QR Codes", icon: QrCode, match: "qr" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        section === item.match ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}>
                      <Icon className="h-4 w-4" /> {item.label}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        </aside>
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          <div className="p-6 max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
