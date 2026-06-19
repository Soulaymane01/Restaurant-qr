import type { ThemePreset } from "./themes"
import type { CSSProperties } from "react"

export function getHeaderStyle(style: string | undefined | null, theme: ThemePreset, accent: string): {
  wrapper: string
  showBar: boolean
  contentPadding: string
  bgStyle?: CSSProperties
} {
  switch (style) {
    case "solid":
      return { wrapper: "", showBar: false, contentPadding: "py-10", bgStyle: { backgroundColor: accent } }
    case "minimal":
      return { wrapper: "bg-white border-b border-gray-200", showBar: false, contentPadding: "py-6" }
    case "centered":
      return { wrapper: theme.headerBg, showBar: true, contentPadding: "py-16" }
    case "gradient":
    default:
      return { wrapper: theme.headerBg, showBar: true, contentPadding: "py-10" }
  }
}

export function getCardStyle(style: string | undefined | null): {
  wrapper: string
  borderSide: "left" | "top" | "none"
} {
  switch (style) {
    case "shadow":
      return { wrapper: "bg-white rounded-xl shadow-lg border border-gray-100", borderSide: "none" }
    case "minimal":
      return { wrapper: "bg-white/40 backdrop-blur-sm rounded-xl", borderSide: "none" }
    case "color-top":
      return { wrapper: "bg-white rounded-xl shadow-sm", borderSide: "top" }
    case "accent-border":
    default:
      return { wrapper: "bg-white rounded-xl shadow-sm", borderSide: "left" }
  }
}

export function getFontClasses(style: string | undefined | null): string {
  switch (style) {
    case "serif": return "font-serif"
    case "spacious": return "tracking-wider font-light leading-relaxed"
    case "bold": return "font-bold"
    default: return "font-sans"
  }
}

export function getBgPattern(style: string | undefined | null, accent: string): CSSProperties | undefined {
  switch (style) {
    case "none":
      return undefined
    case "grid":
      return {
        backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }
    case "waves":
      return { background: `repeating-linear-gradient(45deg, transparent, transparent 6px, ${accent}0D 6px, ${accent}0D 12px)` }
    case "dots":
    default:
      return { backgroundImage: `radial-gradient(${accent}33 1px, transparent 1px)`, backgroundSize: "20px 20px" }
  }
}

export function getImageLayout(layout: string | undefined | null): {
  container: string
  wrapper: string
  imgClasses: string
  showImage: boolean
  isGrid: boolean
} {
  switch (layout) {
    case "top":
      return { container: "flex flex-col", wrapper: "w-full", imgClasses: "w-full h-40 object-cover", showImage: true, isGrid: false }
    case "grid":
      return { container: "", wrapper: "", imgClasses: "w-full h-full object-cover", showImage: true, isGrid: true }
    case "thumbnail":
      return { container: "flex items-start", wrapper: "w-16 shrink-0", imgClasses: "w-16 h-16 object-cover rounded-md", showImage: true, isGrid: false }
    case "hidden":
      return { container: "flex", wrapper: "", imgClasses: "", showImage: false, isGrid: false }
    case "side":
    default:
      return { container: "flex", wrapper: "w-28 shrink-0", imgClasses: "w-full h-28 object-cover rounded-l-xl", showImage: true, isGrid: false }
  }
}

export function getItemNameClass(fontStyle: string | undefined | null): string {
  switch (fontStyle) {
    case "serif": return "font-bold italic tracking-tight"
    case "bold": return "font-extrabold tracking-tight"
    case "spacious": return "font-light tracking-wide"
    default: return "font-semibold"
  }
}
