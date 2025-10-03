export interface Product {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  price: number
  reorderLevel: number
  supplier: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  type: "purchase" | "sale"
  status: "pending" | "processing" | "completed" | "cancelled"
  items: OrderItem[]
  totalAmount: number
  customerName?: string
  supplierName?: string
  orderDate: string
  completedDate?: string
  notes?: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface InventoryStats {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStock: number
  totalOrders: number
  pendingOrders: number
}
