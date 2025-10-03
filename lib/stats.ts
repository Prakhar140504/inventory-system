import { getProducts, getOrders } from "./storage"
import type { InventoryStats } from "./types"

export function calculateInventoryStats(): InventoryStats {
  const products = getProducts()
  const orders = getOrders()

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
  const lowStockItems = products.filter((p) => p.quantity > 0 && p.quantity <= p.reorderLevel).length
  const outOfStock = products.filter((p) => p.quantity === 0).length
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length

  return {
    totalProducts,
    totalValue,
    lowStockItems,
    outOfStock,
    totalOrders,
    pendingOrders,
  }
}
