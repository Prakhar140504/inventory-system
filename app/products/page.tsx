"use client"

import { useEffect, useState } from "react"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductDialog } from "@/components/product-dialog"
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/storage"
import type { Product } from "@/lib/types"
import { Plus, Search, MoreVertical, Pencil, Trash2, AlertTriangle } from "lucide-react"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.supplier.toLowerCase().includes(query),
        ),
      )
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

  const loadProducts = () => {
    setProducts(getProducts())
  }

  const handleAddProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    addProduct(productData)
    loadProducts()
  }

  const handleUpdateProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
      loadProducts()
      setEditingProduct(undefined)
    }
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
      loadProducts()
    }
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingProduct(undefined)
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return { label: "Out of Stock", variant: "destructive" as const }
    }
    if (product.quantity <= product.reorderLevel) {
      return { label: "Low Stock", variant: "secondary" as const }
    }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">Products</h1>
            <p className="text-muted-foreground">Manage your inventory items</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No products found" : "No products yet. Add your first product to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.quantity <= product.reorderLevel && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.supplier}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(product)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        product={editingProduct}
        onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
      />
    </div>
  )
}
