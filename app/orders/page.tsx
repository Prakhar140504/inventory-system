"use client"

import { useEffect, useState } from "react"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderDialog } from "@/components/order-dialog"
import { getOrders, addOrder, updateOrder, deleteOrder } from "@/lib/storage"
import type { Order } from "@/lib/types"
import { Plus, Search, MoreVertical, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | undefined>()

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (typeFilter !== "all") {
      filtered = filtered.filter((o) => o.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customerName?.toLowerCase().includes(query) ||
          o.supplierName?.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(filtered)
  }, [searchQuery, typeFilter, statusFilter, orders])

  const loadOrders = () => {
    setOrders(getOrders())
  }

  const handleAddOrder = (orderData: Omit<Order, "id" | "orderNumber">) => {
    addOrder(orderData)
    loadOrders()
  }

  const handleUpdateOrder = (orderData: Omit<Order, "id" | "orderNumber">) => {
    if (editingOrder) {
      updateOrder(editingOrder.id, orderData)
      loadOrders()
      setEditingOrder(undefined)
    }
  }

  const handleDeleteOrder = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrder(id)
      loadOrders()
    }
  }

  const handleEditClick = (order: Order) => {
    setEditingOrder(order)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingOrder(undefined)
    }
  }

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateOrder(orderId, {
      status: newStatus,
      completedDate: newStatus === "completed" ? new Date().toISOString() : undefined,
    })
    loadOrders()
  }

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getTypeVariant = (type: Order["type"]) => {
    return type === "sale" ? "default" : "secondary"
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sale">Sales</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer/Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                      ? "No orders found"
                      : "No orders yet. Create your first order to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeVariant(order.type)}>{order.type === "sale" ? "Sale" : "Purchase"}</Badge>
                    </TableCell>
                    <TableCell>{order.customerName || order.supplierName}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="text-right font-medium">₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(order)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.status !== "completed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "completed")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Completed
                            </DropdownMenuItem>
                          )}
                          {order.status !== "cancelled" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "cancelled")}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <OrderDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        order={editingOrder}
        onSave={editingOrder ? handleUpdateOrder : handleAddOrder}
      />
    </div>
  )
}
