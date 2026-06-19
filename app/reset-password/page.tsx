"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Eye, EyeOff } from "lucide-react"

function ResetForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => { if (!token) { toast.error("Invalid reset link"); router.push("/login") } }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirm) return
    if (password !== confirm) { toast.error("Passwords don't match"); return }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to reset password"); return }
      setDone(true)
      toast.success("Password reset! Sign in with your new password.")
    } catch { toast.error("Something went wrong") } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mb-4">
            <QrCode className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
          <p className="text-sm text-muted-foreground mb-6">Your password has been updated.</p>
          <Button onClick={() => router.push("/login")} size="lg">Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10 text-base" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">Confirm Password</label>
            <Input id="confirm" type="password" placeholder="Repeat password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} className="text-base" required />
          </div>
          <Button type="submit" size="lg" className="w-full text-base" disabled={loading || !password || !confirm}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <ResetForm />
    </Suspense>
  )
}
