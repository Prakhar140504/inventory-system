"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { initializeSampleData, getProducts, getOrders } from "@/lib/storage"
import { calculateInventoryStats } from "@/lib/stats"
import type { InventoryStats, Product, Order } from "@/lib/types"
import {
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ category: string; count: number; value: number }[]>([])

  useEffect(() => {
    initializeSampleData()
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    const products = getProducts()
    const orders = getOrders()

    setStats(calculateInventoryStats())

    // Get low stock products
    const lowStock = products
      .filter((p) => p.quantity > 0 && p.quantity <= p.reorderLevel)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5)
    setLowStockProducts(lowStock)

    // Get recent orders
    const recent = orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 5)
    setRecentOrders(recent)

    // Calculate category breakdown
    const categoryMap = new Map<string, { count: number; value: number }>()
    products.forEach((p) => {
      const existing = categoryMap.get(p.category) || { count: 0, value: 0 }
      categoryMap.set(p.category, {
        count: existing.count + 1,
        value: existing.value + p.quantity * p.price,
      })
    })
    const breakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value)
    setCategoryBreakdown(breakdown)
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </main>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      description: "Items in inventory",
    },
    {
      title: "Inventory Value",
      value: `₹${stats.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Total stock value",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      description: "Need reordering",
      alert: stats.lowStockItems > 0,
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: XCircle,
      description: "Items unavailable",
      alert: stats.outOfStock > 0,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: "All time orders",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      description: "Awaiting processing",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inventory and orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className={cn("h-4 w-4", stat.alert ? "text-destructive" : "text-muted-foreground")} />
                </CardHeader>
                <CardContent>
                  <div className={cn("text-2xl font-bold mb-1", stat.alert && "text-destructive")}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-muted-foreground">{cat.count} items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(cat.value / stats.totalValue) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[80px] text-right">₹{cat.value.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All products are well stocked</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-destructive">{product.quantity} left</p>
                        <p className="text-xs text-muted-foreground">Reorder at {product.reorderLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {order.type === "sale" ? (
                        <TrendingUp className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-sm font-mono">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerName || order.supplierName} • {order.items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{order.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
