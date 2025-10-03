import type { Product, Order } from "./types"

const PRODUCTS_KEY = "inventory_products"
const ORDERS_KEY = "inventory_orders"

// Product operations
export function getProducts(): Product[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(PRODUCTS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function addProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveProducts(products)
  return products[index]
}

export function deleteProduct(id: string): boolean {
  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)
  if (filtered.length === products.length) return false
  saveProducts(filtered)
  return true
}

// Order operations
export function getOrders(): Order[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(ORDERS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function addOrder(order: Omit<Order, "id" | "orderNumber">): Order {
  const orders = getOrders()
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    orderNumber,
  }
  orders.push(newOrder)
  saveOrders(orders)
  return newOrder
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) return null

  orders[index] = {
    ...orders[index],
    ...updates,
  }
  saveOrders(orders)
  return orders[index]
}

export function deleteOrder(id: string): boolean {
  const orders = getOrders()
  const filtered = orders.filter((o) => o.id !== id)
  if (filtered.length === orders.length) return false
  saveOrders(filtered)
  return true
}

// Initialize with sample data if empty
export function initializeSampleData(): void {
  if (typeof window === "undefined") return

  const products = getProducts()
  if (products.length === 0) {
    const sampleProducts: Omit<Product, "id" | "createdAt" | "updatedAt">[] = [
      {
        name: 'Laptop Pro 15"',
        sku: "LAP-001",
        category: "Electronics",
        quantity: 45,
        price: 89999,
        reorderLevel: 10,
        supplier: "Tech Supplies Inc",
        description: "High-performance laptop for professionals",
      },
      {
        name: "Wireless Mouse",
        sku: "MOU-002",
        category: "Accessories",
        quantity: 8,
        price: 1999,
        reorderLevel: 15,
        supplier: "Peripheral World",
        description: "Ergonomic wireless mouse",
      },
      {
        name: "Office Chair",
        sku: "FUR-003",
        category: "Furniture",
        quantity: 0,
        price: 24999,
        reorderLevel: 5,
        supplier: "Office Furniture Co",
        description: "Ergonomic office chair with lumbar support",
      },
      {
        name: "USB-C Cable",
        sku: "CAB-004",
        category: "Accessories",
        quantity: 150,
        price: 899,
        reorderLevel: 50,
        supplier: "Cable Masters",
        description: "6ft USB-C charging cable",
      },
    ]

    sampleProducts.forEach((product) => addProduct(product))
  }

  const orders = getOrders()
  if (orders.length === 0) {
    const products = getProducts()
    const sampleOrders: Omit<Order, "id" | "orderNumber">[] = [
      {
        type: "sale",
        status: "completed",
        items: [
          {
            productId: products[0]?.id || "",
            productName: 'Laptop Pro 15"',
            quantity: 2,
            price: 89999,
            subtotal: 179998,
          },
        ],
        totalAmount: 179998,
        customerName: "Acme Corporation",
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        type: "purchase",
        status: "pending",
        items: [
          {
            productId: products[2]?.id || "",
            productName: "Office Chair",
            quantity: 10,
            price: 24999,
            subtotal: 249990,
          },
        ],
        totalAmount: 249990,
        supplierName: "Office Furniture Co",
        orderDate: new Date().toISOString(),
      },
    ]

    sampleOrders.forEach((order) => addOrder(order))
  }
}
