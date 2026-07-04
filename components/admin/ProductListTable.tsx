'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit2, Trash2, Plus, Eye, ExternalLink, Loader2 } from 'lucide-react'
import { type Product } from '@/types'
import { deleteProductAction } from '@/app/actions/admin-products'
import { toast } from 'sonner'

interface ProductListTableProps {
  initialProducts: Product[];
}

export default function ProductListTable({ initialProducts }: ProductListTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return

    setDeletingId(id)
    try {
      const res = await deleteProductAction(id)
      if (res.success) {
        setProducts(products.filter((p) => p.id !== id))
        toast.success(`"${title}" deleted successfully`)
      } else {
        toast.error(res.error || 'Failed to delete product')
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    } finally {
      setDeletingId(null)
    }
  }

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  const statusColors: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200',
    available: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50',
    reserved: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50',
    sold: 'bg-destructive/10 text-destructive border-destructive/20',
    archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 border-zinc-200'
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Topbar */}
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
          Inventory Count: {products.length} Items
        </p>
        <Link
          href="/admin/products/new"
          className="bg-foreground text-background text-xs font-bold uppercase tracking-widest py-2.5 px-4 flex items-center gap-1.5 hover:bg-foreground/80 transition-colors rounded-sm"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-border/30 rounded-sm bg-secondary/5">
        {products.length === 0 ? (
          <div className="text-center py-16 text-xs text-foreground/45 space-y-2">
            <p>No products in your catalog yet.</p>
            <Link href="/admin/products/new" className="text-foreground font-bold hover:underline">
              Add your first piece →
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-[9px] uppercase tracking-wider font-bold border-b border-border/30">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {products.map((product) => {
                const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
                return (
                  <tr key={product.id} className="hover:bg-secondary/15 transition-colors">
                    {/* Item title and image */}
                    <td className="px-6 py-4 font-medium flex items-center space-x-3">
                      <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden bg-secondary rounded-sm border border-border/10">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold uppercase tracking-wide truncate block max-w-[200px] text-foreground">
                          {product.title}
                        </span>
                        <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-light">
                          {product.brand?.name || 'Generic'}
                        </span>
                      </div>
                    </td>

                    {/* Condition */}
                    <td className="px-6 py-4 uppercase font-bold text-foreground/60">
                      {product.condition}
                    </td>

                    {/* Size */}
                    <td className="px-6 py-4 uppercase font-bold text-foreground/60">
                      {product.size || 'OS'}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-black">
                      {currencySymbol}{product.price.toLocaleString()}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-sm ${statusColors[product.status] || ''}`}>
                        {product.status}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4 font-medium text-foreground/50">
                      {product.view_count}
                    </td>

                    {/* Actions row */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {product.status !== 'draft' && product.status !== 'archived' && (
                        <Link
                          href={`/shop/${product.slug}`}
                          target="_blank"
                          className="inline-flex p-1.5 rounded-sm text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex p-1.5 rounded-sm text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deletingId === product.id}
                        className="inline-flex p-1.5 rounded-sm text-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete product"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
