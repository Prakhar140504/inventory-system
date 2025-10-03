"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Order, Product, OrderItem } from "@/lib/types"
import { getProducts } from "@/lib/storage"
import { Plus, Trash2 } from "lucide-react"

interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: Order
  onSave: (order: Omit<Order, "id" | "orderNumber">) => void
}

export function OrderDialog({ open, onOpenChange, order, onSave }: OrderDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    type: order?.type || ("sale" as "purchase" | "sale"),
    status: order?.status || ("pending" as "pending" | "processing" | "completed" | "cancelled"),
    customerName: order?.customerName || "",
    supplierName: order?.supplierName || "",
    orderDate: order?.orderDate
      ? new Date(order.orderDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: order?.notes || "",
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order?.items || [])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("1")

  useEffect(() => {
    if (open) {
      setProducts(getProducts())
    }
  }, [open])

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const existingItem = orderItems.find((item) => item.productId === selectedProductId)
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === selectedProductId
            ? {
                ...item,
                quantity: item.quantity + Number.parseInt(quantity),
                subtotal: (item.quantity + Number.parseInt(quantity)) * item.price,
              }
            : item,
        ),
      )
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: Number.parseInt(quantity),
        price: product.price,
        subtotal: Number.parseInt(quantity) * product.price,
      }
      setOrderItems([...orderItems, newItem])
    }

    setSelectedProductId("")
    setQuantity("1")
  }

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderItems.length === 0) {
      alert("Please add at least one item to the order")
      return
    }

    onSave({
      type: formData.type,
      status: formData.status,
      items: orderItems,
      totalAmount: calculateTotal(),
      customerName: formData.type === "sale" ? formData.customerName : undefined,
      supplierName: formData.type === "purchase" ? formData.supplierName : undefined,
      orderDate: new Date(formData.orderDate).toISOString(),
      completedDate: formData.status === "completed" ? new Date().toISOString() : undefined,
      notes: formData.notes,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Create New Order"}</DialogTitle>
          <DialogDescription>
            {order ? "Update order information" : "Enter details for the new order"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Order Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "purchase" | "sale") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "processing" | "completed" | "cancelled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {formData.type === "sale" ? (
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <Label>Order Items *</Label>
              <div className="flex gap-2">
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ₹{product.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-24"
                  placeholder="Qty"
                />
                <Button type="button" onClick={handleAddItem} disabled={!selectedProductId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {orderItems.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{item.subtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">₹{calculateTotal().toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{order ? "Update Order" : "Create Order"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
