import { MenuDisplay } from "@/components/menu/menu-display"
import { adminDb } from "@/lib/firebase-admin"

export default async function MenuPage({
  params,
}: {
  params: { slug: string; tableNumber: string }
}) {
  const { slug, tableNumber } = params

  const snapshot = await adminDb
    .collection("restaurants")
    .where("slug", "==", slug)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Restaurant not found</p>
      </div>
    )
  }

  const restaurantId = snapshot.docs[0].id

  return <MenuDisplay restaurantId={restaurantId} tableNumber={tableNumber} />
}
