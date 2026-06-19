"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Copy, Check } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetUrl, setResetUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) { toast.error("Something went wrong"); return }
      const data = await res.json()
      if (data.resetUrl) setResetUrl(data.resetUrl)
      else toast.success("If the email exists, a reset link has been generated")
    } catch { toast.error("Something went wrong") } finally { setLoading(false) }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {resetUrl ? "Click the link below to reset your password" : "Enter your email to get a reset link"}
          </p>
        </div>
        {!resetUrl ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="text-base" autoFocus required />
            </div>
            <Button type="submit" size="lg" className="w-full text-base" disabled={loading || !email}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 break-all text-sm font-mono">{resetUrl}</div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" size="lg" className="flex-1 gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button onClick={() => window.open(resetUrl, "_self")} size="lg" className="flex-1">Open Reset Page</Button>
            </div>
          </div>
        )}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary font-medium hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
