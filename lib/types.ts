export interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  logo?: string
  theme: string
  customColor?: string
  headerStyle?: string
  cardStyle?: string
  fontStyle?: string
  backgroundStyle?: string
  imageLayout?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  order: number
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  categoryId?: string
  restaurantId: string
  imageUrl?: string
  available: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface QRCode {
  id: string
  tableNumber: number
  restaurantId: string
  qrCodeUrl: string
  createdAt: Date
}
