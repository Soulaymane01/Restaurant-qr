export interface ThemePreset {
  id: string
  name: string
  description: string
  defaultAccent: string
  defaults: {
    headerStyle: string
    cardStyle: string
    fontStyle: string
    backgroundStyle: string
    imageLayout: string
  }
  previewBg: string
  previewHeader: string
  previewCard: string
  previewAccent: string
  pageBg: string
  pagePattern: string
  headerBg: string
  headerPattern: string
  card: string
  cardBorder: string
  cardShadow: string
  text: string
  textMuted: string
  heading: string
  itemName: string
  tab: string
  tabInactive: string
  badge: string
  badgeText: string
  divider: string
  footer: string
}

export const themePresets: ThemePreset[] = [
  {
    id: "classic", name: "Classic", description: "Warm amber tones, cozy bistro feel",
    defaultAccent: "#b45309", defaults: { headerStyle: "gradient", cardStyle: "accent-border", fontStyle: "default", backgroundStyle: "dots", imageLayout: "side" }, previewBg: "bg-gradient-to-br from-amber-50 to-amber-100",
    previewHeader: "bg-amber-800", previewCard: "bg-white/80", previewAccent: "bg-amber-600",
    pageBg: "bg-amber-50", pagePattern: "bg-[radial-gradient(#d4a76233_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-amber-800 via-amber-700 to-amber-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-amber-950", textMuted: "text-amber-700/60", heading: "text-amber-50",
    itemName: "text-amber-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300",
    badge: "bg-amber-100 border-amber-300", badgeText: "text-amber-800", divider: "border-amber-200/50",
    footer: "text-amber-300",
  },
  {
    id: "midnight", name: "Midnight", description: "Dark slate, premium steakhouse feel",
    defaultAccent: "#3b82f6", defaults: { headerStyle: "minimal", cardStyle: "shadow", fontStyle: "default", backgroundStyle: "dots", imageLayout: "thumbnail" }, previewBg: "bg-gradient-to-br from-slate-900 to-slate-800",
    previewHeader: "bg-slate-700", previewCard: "bg-slate-800/80", previewAccent: "bg-blue-500",
    pageBg: "bg-slate-900", pagePattern: "bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800",
    headerPattern: "bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-slate-800", cardBorder: "border-l-4", cardShadow: "shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30",
    text: "text-slate-300", textMuted: "text-slate-500", heading: "text-white", itemName: "text-white", tab: "rounded-lg",
    tabInactive: "bg-slate-700/60 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-slate-500",
    badge: "bg-slate-700 border-slate-600", badgeText: "text-slate-200", divider: "border-slate-700/50", footer: "text-slate-600",
  },
  {
    id: "fresh", name: "Fresh", description: "Clean emerald, natural healthy vibe",
    defaultAccent: "#047857", defaults: { headerStyle: "gradient", cardStyle: "color-top", fontStyle: "spacious", backgroundStyle: "waves", imageLayout: "top" }, previewBg: "bg-gradient-to-br from-green-50 to-emerald-100",
    previewHeader: "bg-emerald-700", previewCard: "bg-white/80", previewAccent: "bg-emerald-600",
    pageBg: "bg-emerald-50", pagePattern: "bg-[radial-gradient(#34d39933_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-emerald-950", textMuted: "text-emerald-700/60", heading: "text-emerald-50",
    itemName: "text-emerald-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
    badge: "bg-emerald-100 border-emerald-300", badgeText: "text-emerald-800", divider: "border-emerald-200/50",
    footer: "text-emerald-300",
  },
  {
    id: "rustic", name: "Rustic", description: "Warm rose, earthy farm-to-table",
    defaultAccent: "#be123c", defaults: { headerStyle: "centered", cardStyle: "accent-border", fontStyle: "serif", backgroundStyle: "grid", imageLayout: "side" }, previewBg: "bg-gradient-to-br from-orange-50 to-rose-100",
    previewHeader: "bg-rose-700", previewCard: "bg-white/80", previewAccent: "bg-rose-600",
    pageBg: "bg-rose-50", pagePattern: "bg-[radial-gradient(#f43f5e33_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-rose-800 via-rose-700 to-orange-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-rose-950", textMuted: "text-rose-700/60", heading: "text-rose-50",
    itemName: "text-rose-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300",
    badge: "bg-rose-100 border-rose-300", badgeText: "text-rose-800", divider: "border-rose-200/50",
    footer: "text-rose-300",
  },
  {
    id: "ocean", name: "Ocean", description: "Cool teal blue, coastal seafood",
    defaultAccent: "#0e7490", defaults: { headerStyle: "gradient", cardStyle: "minimal", fontStyle: "spacious", backgroundStyle: "waves", imageLayout: "top" }, previewBg: "bg-gradient-to-br from-cyan-50 to-blue-100",
    previewHeader: "bg-cyan-700", previewCard: "bg-white/80", previewAccent: "bg-cyan-600",
    pageBg: "bg-cyan-50", pagePattern: "bg-[radial-gradient(#22d3ee33_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-cyan-800 via-cyan-700 to-blue-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-cyan-950", textMuted: "text-cyan-700/60", heading: "text-cyan-50",
    itemName: "text-cyan-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300",
    badge: "bg-cyan-100 border-cyan-300", badgeText: "text-cyan-800", divider: "border-cyan-200/50",
    footer: "text-cyan-300",
  },
  {
    id: "sunset", name: "Sunset", description: "Vibrant orange coral, energetic",
    defaultAccent: "#ea580c", defaults: { headerStyle: "solid", cardStyle: "color-top", fontStyle: "bold", backgroundStyle: "dots", imageLayout: "side" }, previewBg: "bg-gradient-to-br from-orange-50 to-red-100",
    previewHeader: "bg-orange-700", previewCard: "bg-white/80", previewAccent: "bg-orange-600",
    pageBg: "bg-orange-50", pagePattern: "bg-[radial-gradient(#f9731633_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-orange-800 via-orange-700 to-red-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-orange-950", textMuted: "text-orange-700/60", heading: "text-orange-50",
    itemName: "text-orange-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300",
    badge: "bg-orange-100 border-orange-300", badgeText: "text-orange-800", divider: "border-orange-200/50",
    footer: "text-orange-300",
  },
  {
    id: "lavender", name: "Lavender", description: "Soft purple, elegant boutique",
    defaultAccent: "#7c3aed", defaults: { headerStyle: "gradient", cardStyle: "shadow", fontStyle: "default", backgroundStyle: "dots", imageLayout: "thumbnail" }, previewBg: "bg-gradient-to-br from-purple-50 to-violet-100",
    previewHeader: "bg-purple-700", previewCard: "bg-white/80", previewAccent: "bg-purple-600",
    pageBg: "bg-purple-50", pagePattern: "bg-[radial-gradient(#a855f733_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-purple-800 via-purple-700 to-violet-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-purple-950", textMuted: "text-purple-700/60", heading: "text-purple-50",
    itemName: "text-purple-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300",
    badge: "bg-purple-100 border-purple-300", badgeText: "text-purple-800", divider: "border-purple-200/50",
    footer: "text-purple-300",
  },
  {
    id: "forest", name: "Forest", description: "Deep green, natural organic feel",
    defaultAccent: "#166534", defaults: { headerStyle: "centered", cardStyle: "minimal", fontStyle: "serif", backgroundStyle: "grid", imageLayout: "side" }, previewBg: "bg-gradient-to-br from-lime-50 to-green-100",
    previewHeader: "bg-green-700", previewCard: "bg-white/80", previewAccent: "bg-green-600",
    pageBg: "bg-green-50", pagePattern: "bg-[radial-gradient(#4ade8033_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-green-800 via-green-700 to-lime-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-green-950", textMuted: "text-green-700/60", heading: "text-green-50",
    itemName: "text-green-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300",
    badge: "bg-green-100 border-green-300", badgeText: "text-green-800", divider: "border-green-200/50",
    footer: "text-green-300",
  },
  {
    id: "stone", name: "Stone", description: "Neutral gray, minimalist modern",
    defaultAccent: "#44403c", defaults: { headerStyle: "minimal", cardStyle: "minimal", fontStyle: "default", backgroundStyle: "none", imageLayout: "hidden" }, previewBg: "bg-gradient-to-br from-stone-100 to-stone-200",
    previewHeader: "bg-stone-700", previewCard: "bg-white/80", previewAccent: "bg-stone-600",
    pageBg: "bg-stone-100", pagePattern: "bg-[radial-gradient(#a8a29e33_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-stone-950", textMuted: "text-stone-700/60", heading: "text-stone-50",
    itemName: "text-stone-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-stone-700 border border-stone-200 hover:bg-stone-100 hover:border-stone-300",
    badge: "bg-stone-100 border-stone-300", badgeText: "text-stone-800", divider: "border-stone-200/50",
    footer: "text-stone-300",
  },
  {
    id: "ruby", name: "Ruby", description: "Bold red, passionate and striking",
    defaultAccent: "#dc2626", defaults: { headerStyle: "solid", cardStyle: "color-top", fontStyle: "bold", backgroundStyle: "dots", imageLayout: "top" }, previewBg: "bg-gradient-to-br from-red-50 to-rose-100",
    previewHeader: "bg-red-700", previewCard: "bg-white/80", previewAccent: "bg-red-600",
    pageBg: "bg-red-50", pagePattern: "bg-[radial-gradient(#ef444433_1px,transparent_1px)] bg-[length:20px_20px]",
    headerBg: "bg-gradient-to-br from-red-800 via-red-700 to-rose-800",
    headerPattern: "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[length:16px_16px]",
    card: "bg-white", cardBorder: "border-l-4", cardShadow: "shadow-sm hover:shadow-md",
    text: "text-red-950", textMuted: "text-red-700/60", heading: "text-red-50",
    itemName: "text-red-900", tab: "rounded-lg",
    tabInactive: "bg-white/70 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300",
    badge: "bg-red-100 border-red-300", badgeText: "text-red-800", divider: "border-red-200/50",
    footer: "text-red-300",
  },
]

export function getThemeById(id: string): ThemePreset {
  return themePresets.find((t) => t.id === id) || themePresets[0]
}
