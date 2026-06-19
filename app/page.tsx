import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold mb-3">RestaurantQR</h1>
        <p className="text-muted-foreground mb-6">
          Digital menu QR code system for restaurants
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}
