export interface OptionGroup<T extends string> {
  id: string
  label: string
  description: string
  options: Option<T>[]
}

export interface Option<T extends string> {
  id: T
  name: string
  description: string
}

export const headerOptions: OptionGroup<string> = {
  id: "headerStyle",
  label: "Header Style",
  description: "How the restaurant header looks",
  options: [
    { id: "gradient", name: "Gradient", description: "Smooth color gradient" },
    { id: "solid", name: "Solid", description: "Solid bold color" },
    { id: "minimal", name: "Minimal", description: "Clean and simple" },
    { id: "centered", name: "Centered", description: "Wide centered layout" },
  ],
}

export const cardOptions: OptionGroup<string> = {
  id: "cardStyle",
  label: "Item Cards",
  description: "How menu items are displayed",
  options: [
    { id: "accent-border", name: "Accent Border", description: "Color strip on the left" },
    { id: "shadow", name: "Shadow", description: "Elevated floating card" },
    { id: "minimal", name: "Minimal", description: "Clean, no border" },
    { id: "color-top", name: "Color Top", description: "Color strip on top" },
  ],
}

export const fontOptions: OptionGroup<string> = {
  id: "fontStyle",
  label: "Font Style",
  description: "Text appearance",
  options: [
    { id: "default", name: "Default", description: "Clean modern font" },
    { id: "serif", name: "Serif", description: "Classic serif headings" },
    { id: "spacious", name: "Spacious", description: "Light and airy" },
    { id: "bold", name: "Bold", description: "Strong impactful text" },
  ],
}

export const bgOptions: OptionGroup<string> = {
  id: "backgroundStyle",
  label: "Background",
  description: "Page background texture",
  options: [
    { id: "dots", name: "Dots", description: "Subtle dot pattern" },
    { id: "none", name: "Solid", description: "Clean solid color" },
    { id: "grid", name: "Grid", description: "Grid line pattern" },
    { id: "waves", name: "Waves", description: "Wave pattern" },
  ],
}

export const imageLayoutOptions: OptionGroup<string> = {
  id: "imageLayout",
  label: "Image Layout",
  description: "How item photos are shown",
  options: [
    { id: "side", name: "Side", description: "Image on the left side" },
    { id: "top", name: "Top", description: "Image on top of the card" },
    { id: "thumbnail", name: "Thumbnail", description: "Small thumbnail" },
    { id: "hidden", name: "Hidden", description: "Hide images" },
  ],
}

export interface DesignSettings {
  headerStyle: string
  cardStyle: string
  fontStyle: string
  backgroundStyle: string
  imageLayout: string
  customColor: string
}

export const defaultDesign: DesignSettings = {
  headerStyle: "gradient",
  cardStyle: "accent-border",
  fontStyle: "default",
  backgroundStyle: "dots",
  imageLayout: "side",
  customColor: "",
}

export const designGroups = [headerOptions, cardOptions, fontOptions, bgOptions, imageLayoutOptions]
