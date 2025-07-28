export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "restaurant" | "manager" | "worker" | "client"
  restaurantId?: string
  approved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  phone: string
  email: string
  ownerId: string
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
  categoryId: string
  restaurantId: string
  imageUrl?: string
  available: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  tableNumber: number
  restaurantId: string
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  customerName?: string
  customerPhone?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface QRCode {
  id: string
  tableNumber: number
  restaurantId: string
  qrCodeUrl: string
  createdAt: Date
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}
