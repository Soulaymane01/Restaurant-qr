"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Check, ExternalLink, Palette } from "lucide-react"
import { db } from "@/lib/firebase"

interface Props {
  restaurantId: string
}
import { doc, getDoc } from "firebase/firestore"
import { themePresets } from "@/lib/themes"
import { designGroups, type DesignSettings, defaultDesign } from "@/lib/design-options"
import type { Restaurant } from "@/lib/types"

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function GroupPreview({ groupId, optionId, accent }: { groupId: string; optionId: string; accent: string }) {
  const c = accent
  if (groupId === "headerStyle") {
    if (optionId === "minimal") return <div className="w-full h-full rounded-lg bg-white border border-gray-200 flex flex-col overflow-hidden"><div className="h-1 bg-gray-200" /><div className="flex-1 flex items-center justify-center px-2"><div className="w-3/4 h-1.5 rounded bg-gray-300" /></div></div>
    if (optionId === "solid") return <div className="w-full h-full rounded-lg flex flex-col overflow-hidden" style={{ backgroundColor: c }}><div className="h-1" style={{ backgroundColor: hexToRgba(c, 0.3) }} /><div className="flex-1 flex items-center justify-center px-2"><div className="w-3/4 h-1.5 rounded bg-white/40" /></div></div>
    return <div className="w-full h-full rounded-lg flex flex-col overflow-hidden" style={{ background: `linear-gradient(135deg, ${c}, ${hexToRgba(c, 0.6)})` }}><div className="h-1 bg-white/30" /><div className="flex-1 flex items-center justify-center px-2"><div className="w-3/4 h-1.5 rounded bg-white/40" /></div></div>
  }
  if (groupId === "cardStyle") {
    if (optionId === "shadow") return <div className="w-full h-full rounded-lg bg-white shadow-md border border-gray-100 flex items-center justify-center"><div className="w-3/4 h-2 rounded bg-gray-100" /></div>
    if (optionId === "minimal") return <div className="w-full h-full rounded-lg bg-white/40 flex items-center justify-center"><div className="w-3/4 h-2 rounded bg-gray-200/50" /></div>
    if (optionId === "color-top") return <div className="w-full h-full rounded-lg bg-white flex flex-col overflow-hidden shadow-sm"><div className="h-1.5 w-full" style={{ backgroundColor: c }} /><div className="flex-1 flex items-center justify-center"><div className="w-3/4 h-2 rounded bg-gray-100" /></div></div>
    return <div className="w-full h-full rounded-lg bg-white flex items-center justify-center shadow-sm overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: c }} /><div className="w-3/4 h-2 rounded bg-gray-100" /></div>
  }
  if (groupId === "fontStyle") {
    const fontClass = optionId === "serif" ? "font-serif italic" : optionId === "spacious" ? "tracking-widest font-light" : optionId === "bold" ? "font-bold" : ""
    return <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ backgroundColor: hexToRgba(c, 0.08) }}><span className={`text-2xl ${fontClass}`} style={{ color: c }}>Aa</span></div>
  }
  if (groupId === "backgroundStyle") {
    if (optionId === "none") return <div className="w-full h-full rounded-lg bg-gray-100" />
    if (optionId === "grid") return <div className="w-full h-full rounded-lg" style={{ backgroundImage: `linear-gradient(${hexToRgba(c, 0.15)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(c, 0.15)} 1px, transparent 1px)`, backgroundSize: "10px 10px" }} />
    if (optionId === "waves") return <div className="w-full h-full rounded-lg" style={{ background: `repeating-linear-gradient(45deg, transparent, transparent 5px, ${hexToRgba(c, 0.06)} 5px, ${hexToRgba(c, 0.06)} 10px)` }} />
    return <div className="w-full h-full rounded-lg" style={{ backgroundImage: `radial-gradient(${hexToRgba(c, 0.2)} 1px, transparent 1px)`, backgroundSize: "10px 10px", backgroundColor: hexToRgba(c, 0.04) }} />
  }
  if (groupId === "imageLayout") {
    if (optionId === "top") return <div className="w-full h-full rounded-lg bg-white border border-gray-100 flex flex-col overflow-hidden"><div className="h-5 bg-gray-100" /><div className="flex-1 flex items-center justify-center px-2"><div className="w-3/4 h-1.5 rounded bg-gray-200" /></div></div>
    if (optionId === "grid") return <div className="w-full h-full rounded-lg bg-white border border-gray-100 p-1.5"><div className="grid grid-cols-2 gap-1"><div className="aspect-[4/3] rounded bg-gray-100" /><div className="aspect-[4/3] rounded bg-gray-100" /><div className="aspect-[4/3] rounded bg-gray-100" /><div className="aspect-[4/3] rounded bg-gray-100" /></div></div>
    if (optionId === "thumbnail") return <div className="w-full h-full rounded-lg bg-white border border-gray-100 flex items-center gap-1.5 px-2"><div className="w-5 h-5 rounded bg-gray-100 shrink-0" /><div className="flex-1 h-1.5 rounded bg-gray-200" /></div>
    if (optionId === "hidden") return <div className="w-full h-full rounded-lg bg-gray-50 flex items-center justify-center"><div className="w-3/4 h-1.5 rounded bg-gray-200" /></div>
    return <div className="w-full h-full rounded-lg bg-white border border-gray-100 flex items-center overflow-hidden"><div className="w-10 h-full bg-gray-100 shrink-0" /><div className="flex-1 px-2"><div className="w-full h-1.5 rounded bg-gray-200" /></div></div>
  }
  return null
}

export function DesignPicker({ restaurantId }: Props) {
  const [selectedTheme, setSelectedTheme] = useState("classic")
  const [settings, setSettings] = useState<DesignSettings>(defaultDesign)
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null)
  const [origin, setOrigin] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "restaurants", restaurantId))
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Restaurant
          setCurrentRestaurant(data)
          setSelectedTheme(data.theme || "classic")
          setSettings({
            headerStyle: data.headerStyle || defaultDesign.headerStyle,
            cardStyle: data.cardStyle || defaultDesign.cardStyle,
            fontStyle: data.fontStyle || defaultDesign.fontStyle,
            backgroundStyle: data.backgroundStyle || defaultDesign.backgroundStyle,
            imageLayout: data.imageLayout || defaultDesign.imageLayout,
            customColor: data.customColor || "",
          })
        }
      } catch { toast.error("Failed to load design settings") } finally { setLoading(false) }
    }
    load()
  }, [restaurantId])

  const currentTheme = useMemo(() => themePresets.find((t) => t.id === selectedTheme) || themePresets[0], [selectedTheme])
  const accent = settings.customColor || currentTheme.defaultAccent

  const updateSetting = (key: keyof DesignSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, string> = { theme: selectedTheme, ...settings }
      if (!body.customColor) body.customColor = ""
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success("Design saved!")
    } catch { toast.error("Failed to save design") } finally { setSaving(false) }
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4"><h2 className="text-lg font-bold">Color Theme</h2><p className="text-sm text-muted-foreground">Pick a base color palette</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {themePresets.map((theme) => {
            const isActive = selectedTheme === theme.id
            const ac = isActive ? accent : theme.defaultAccent
            return (
              <Card key={theme.id} className={`relative cursor-pointer overflow-hidden transition-all ${isActive ? "ring-2 ring-primary shadow-lg scale-[1.02]" : "hover:ring-2 hover:ring-muted-foreground/30 hover:shadow-md"}`} onClick={() => { setSelectedTheme(theme.id); setSettings((prev) => ({ ...prev, ...theme.defaults, customColor: prev.customColor })) }}>
                <div className={`h-28 ${theme.previewBg} flex flex-col items-center justify-center p-3`}>
                  <div className={`w-full rounded-t-md ${theme.previewHeader} h-3 mb-1.5`} />
                  <div className="w-3/4 h-1.5 rounded mb-1" style={{ backgroundColor: ac }} />
                  <div className="w-1/2 h-1.5 rounded mb-2" style={{ backgroundColor: ac, opacity: 0.6 }} />
                  <div className={`w-full rounded ${theme.previewCard} p-1.5 flex gap-1.5`}>
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: ac, opacity: 0.4 }} />
                    <div className="flex-1 space-y-1"><div className="h-1.5 rounded bg-foreground/10 w-3/4" /><div className="h-1.5 rounded bg-foreground/5 w-1/2" /></div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{theme.name}</h3>
                    {isActive && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></div>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{theme.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-4"><h2 className="text-lg font-bold">Accent Color</h2><p className="text-sm text-muted-foreground">Customize the main color</p></div>
        <Card className="p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Palette className="h-5 w-5 text-muted-foreground" /></div>
              <div><Label className="text-sm font-medium">Accent Color</Label><p className="text-xs text-muted-foreground">Overrides the theme default</p></div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <div className="h-9 w-9 rounded-lg border-2 border-muted shadow-sm" style={{ backgroundColor: accent }} />
              <Input type="color" value={accent} onChange={(e) => updateSetting("customColor", e.target.value)} className="w-16 h-9 p-0.5 cursor-pointer" />
              <Input type="text" value={accent} onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) updateSetting("customColor", v) }} className="w-28 font-mono text-sm" placeholder="#000000" />
              {settings.customColor && <Button variant="ghost" size="sm" onClick={() => updateSetting("customColor", "")} className="text-xs text-muted-foreground">Reset</Button>}
            </div>
          </div>
        </Card>
      </section>

      {designGroups.map((group) => (
        <section key={group.id}>
          <div className="mb-4"><h2 className="text-lg font-bold">{group.label}</h2><p className="text-sm text-muted-foreground">{group.description}</p></div>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-rounded">
            {group.options.map((opt) => {
              const isSelected = settings[group.id as keyof DesignSettings] === opt.id
              return (
                <button key={opt.id} onClick={() => updateSetting(group.id as keyof DesignSettings, opt.id)}
                  className={`shrink-0 w-44 rounded-xl border-2 text-left transition-all ${isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-muted-foreground/30 hover:shadow-sm"}`}>
                  <div className="p-3 pb-2"><div className="h-16 rounded-lg overflow-hidden relative"><GroupPreview groupId={group.id} optionId={opt.id} accent={accent} /></div></div>
                  <div className="px-3 pb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0"><p className="text-sm font-medium truncate">{opt.name}</p><p className="text-xs text-muted-foreground truncate">{opt.description}</p></div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-4 pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">{saving ? "Saving..." : "Save Design"}</Button>
        {currentRestaurant?.slug && (
          <Button variant="outline" size="lg" onClick={() => window.open(`${origin}/menu/${currentRestaurant.slug}/1`, "_blank")} className="gap-2">
            <ExternalLink className="h-4 w-4" /> Preview Menu
          </Button>
        )}
      </div>
    </div>
  )
}
