"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, ShoppingCart, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function NavBar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/products", label: "Products", icon: Package },
    { href: "/orders", label: "Orders", icon: ShoppingCart },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Inventory System</span>
            </Link>

            <div className="flex gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
