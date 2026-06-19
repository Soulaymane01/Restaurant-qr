"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { getThemeById } from "@/lib/themes"
import type { Restaurant, Category, MenuItem } from "@/lib/types"
import { getHeaderStyle, getCardStyle, getFontClasses, getBgPattern, getImageLayout, getItemNameClass } from "@/lib/design-utils"
import { MapPin, Phone, UtensilsCrossed } from "lucide-react"

interface Props {
  restaurantId: string
  tableNumber: string
}

export function MenuDisplay({ restaurantId, tableNumber }: Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("")
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [restDoc, catSnapshot, itemSnapshot] = await Promise.all([
          getDocs(query(collection(db, "restaurants"), where("__name__", "==", restaurantId))),
          getDocs(query(collection(db, "categories"), where("restaurantId", "==", restaurantId))),
          getDocs(query(collection(db, "menuItems"), where("restaurantId", "==", restaurantId))),
        ])

        if (!restDoc.empty) {
          const data = { id: restDoc.docs[0].id, ...restDoc.docs[0].data() } as Restaurant
          setRestaurant(data)
        }

        const cats = catSnapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Category))
          .sort((a, b) => a.order - b.order)
        setCategories(cats)
        if (cats.length > 0) setActiveTab(cats[0].id)

        const itemsList = itemSnapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as MenuItem))
          .sort((a, b) => a.order - b.order)
        setItems(itemsList)
      } catch (e) {
        console.error("Failed to load menu", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [restaurantId])

  useEffect(() => {
    if (activeTab && tabsRef.current) {
      const btn = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement
      btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [activeTab])

  const theme = getThemeById(restaurant?.theme)
  const accent = restaurant?.customColor || theme.defaultAccent
  const fontClass = getFontClasses(restaurant?.fontStyle)
  const itemNameClass = getItemNameClass(restaurant?.fontStyle)
  const bgPattern = getBgPattern(restaurant?.backgroundStyle, accent)
  const header = getHeaderStyle(restaurant?.headerStyle, theme, accent)
  const card = getCardStyle(restaurant?.cardStyle)
  const imgLayout = getImageLayout(restaurant?.imageLayout)

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.pageBg}`} style={bgPattern}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <UtensilsCrossed className="h-8 w-8 mx-auto mb-4 animate-pulse" style={{ color: accent }} />
            <p className={theme.textMuted}>Loading menu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.pageBg}`} style={bgPattern}>
        <p className="text-red-500">Restaurant not found</p>
      </div>
    )
  }

  const hasUncategorized = items.some((i) => !i.categoryId)
  const allTabs = [
    ...categories.map((c) => ({ id: c.id, name: c.name })),
    ...(hasUncategorized ? [{ id: "", name: "Menu" }] : []),
  ]

  const isUncategorizedTab = activeTab === ""
  const currentCat = isUncategorizedTab ? null : categories.find((c) => c.id === activeTab)
  const catItems = isUncategorizedTab
    ? items.filter((i) => !i.categoryId)
    : items.filter((i) => i.categoryId === activeTab)
  const hasItems = allTabs.length > 0 ? catItems.length > 0 : items.length > 0

  return (
    <div className={`min-h-screen ${theme.pageBg} ${fontClass}`} style={bgPattern}>
      <div className={`relative overflow-hidden ${header.wrapper}`} style={header.bgStyle}>
        {header.showBar && <div className="h-1.5" style={{ backgroundColor: accent }} />}
        <div className={`absolute inset-0 ${theme.headerPattern} opacity-40`} />
        <div className={`relative max-w-2xl mx-auto px-4 ${header.contentPadding} text-center`}>
          {restaurant.logo && (
            <img src={restaurant.logo} alt="" className="h-20 w-20 mx-auto mb-5 rounded-full object-cover ring-4 ring-white/20 shadow-xl" />
          )}
          <h1 className={`text-3xl font-bold tracking-tight drop-shadow-sm ${theme.heading} ${itemNameClass}`}>{restaurant.name}</h1>
          {restaurant.description && <p className="mt-2 text-white/70 text-sm max-w-md mx-auto leading-relaxed">{restaurant.description}</p>}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/60 flex-wrap">
            {restaurant.address && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{restaurant.address}</span>}
            {restaurant.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{restaurant.phone}</span>}
          </div>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg" style={{ backgroundColor: accent, color: "#fff" }}>
            <UtensilsCrossed className="h-3.5 w-3.5" style={{ color: "#fff" }} />
            <span className="text-xs font-medium">Table {tableNumber}</span>
          </div>
        </div>
      </div>

      <div className={`sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b ${theme.divider}`}>
        <div className="max-w-2xl mx-auto px-4">
          <div ref={tabsRef} className="flex gap-2 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-rounded">
            {allTabs.map((tab) => (
              <button key={tab.id} data-tab={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-lg ${
                  activeTab === tab.id ? "text-white shadow-md" : "bg-white/70 text-foreground/70 border border-border hover:bg-accent hover:border-accent"
                }`}
                style={activeTab === tab.id ? { backgroundColor: accent } : undefined}>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {hasItems && !isUncategorizedTab && currentCat?.description && (
          <p className="text-sm mb-6 italic flex items-center gap-2" style={{ color: accent }}>
            <span className="w-4 h-px bg-current opacity-50" />
            {currentCat.description}
          </p>
        )}

        {!hasItems ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: accent }} />
            <p className={theme.textMuted}>No items in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {catItems.map((item, idx) => (
              <div key={item.id}>
                <div className={`rounded-xl overflow-hidden transition-all duration-200 ${card.wrapper} ${!item.available ? "opacity-50" : ""}`}
                  style={card.borderSide !== "none" ? { [card.borderSide === "left" ? "borderLeft" : "borderTop"]: `4px solid ${accent}` } : undefined}>
                  <div className={imgLayout.container}>
                    {item.imageUrl && imgLayout.showImage && (
                      <div className={`${imgLayout.wrapper} ${imgLayout.container === "flex flex-col" ? "min-h-[10rem]" : "min-h-[7rem]"} overflow-hidden bg-muted`}>
                        <img src={item.imageUrl} alt={item.name} className={imgLayout.imgClasses} />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={`font-semibold ${theme.itemName} ${itemNameClass}`}>{item.name}</h3>
                        <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: accent }}>
                          {item.price.toFixed(2)} MAD
                        </span>
                      </div>
                      {item.description && <p className={`text-sm mt-1.5 ${theme.text} opacity-65 leading-relaxed`}>{item.description}</p>}
                      {!item.available && <Badge variant="secondary" className="mt-2 text-xs">Currently unavailable</Badge>}
                    </div>
                  </div>
                </div>
                {idx < catItems.length - 1 && <div className={`mx-4 my-2 h-px ${theme.divider}`} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`text-center py-8 text-xs ${theme.footer}`}>
        <p>Restaurant QR Menu</p>
      </div>
    </div>
  )
}
