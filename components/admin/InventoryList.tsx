'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, Trash2, Edit, ExternalLink, RefreshCw } from 'lucide-react'
import { type Product, type Category, type Brand } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface InventoryListProps {
  initialProducts: Product[]
  categories: Category[]
  brands: Brand[]
}

type StatusFilter = 'all' | 'draft' | 'available' | 'reserved' | 'sold' | 'archived'

export default function InventoryList({
  initialProducts,
  categories,
  brands
}: InventoryListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  // Filter products based on search query and status filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase()) ||
      (product.brand?.name && product.brand.name.toLowerCase().includes(search.toLowerCase())) ||
      (product.category?.name && product.category.name.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || product.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete product')
      }

      toast.success(`Deleted "${title}"`)
      // Update local state instantly
      setProducts((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const statuses: StatusFilter[] = ['all', 'draft', 'available', 'reserved', 'sold', 'archived']

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/25 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide">
            Inventory
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Manage your curated 1-of-1 drops ({filteredProducts.length} items shown)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest px-4 py-3 hover:bg-foreground/80 transition-colors rounded-sm"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 pl-9 text-xs text-foreground placeholder:text-foreground/35 outline-none focus:border-foreground/40 transition-all rounded-sm"
          />
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-foreground/40" />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border rounded-sm transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table / Cards list */}
      <div className="border border-border/15 rounded-sm overflow-hidden bg-secondary/5">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/20 bg-secondary/20 text-[9px] font-black uppercase tracking-widest text-foreground/50">
                <th className="py-4 px-6 w-16">Item</th>
                <th className="py-4 px-4">Title</th>
                <th className="py-4 px-4">Brand / Cat</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4 text-center">Views</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground/45 uppercase font-bold tracking-widest">
                    No products found matching criteria
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImg = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=100'
                  return (
                    <tr key={product.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="relative h-12 w-9 overflow-hidden bg-secondary border border-border/10 rounded-sm">
                          <Image
                            src={primaryImg}
                            alt={product.title}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-[200px]">
                        <span className="font-bold uppercase tracking-wider block truncate">
                          {product.title}
                        </span>
                        <span className="text-[9px] text-foreground/40 font-semibold block truncate">
                          {product.slug}
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <span className="font-bold text-foreground/80 block uppercase tracking-wider text-[10px]">
                          {product.brand?.name || 'Generic'}
                        </span>
                        <span className="text-[9px] text-foreground/45 uppercase tracking-widest block font-bold">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <span className="block font-medium">Size: {product.size || 'One Size'}</span>
                        <span className="block text-[10px] text-foreground/50 uppercase font-semibold">
                          Cond: {product.condition} • {product.color || 'Curated'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black">
                        {currencySymbol}{product.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-foreground/60">
                        {product.view_count}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            product.status === 'available'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/15'
                              : product.status === 'sold'
                              ? 'bg-destructive/10 text-destructive border border-destructive/15'
                              : product.status === 'reserved'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                              : product.status === 'archived'
                              ? 'bg-foreground/5 text-foreground/45 border border-border/20'
                              : 'bg-foreground/10 text-foreground/70 border border-foreground/15'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {product.status !== 'draft' && product.status !== 'archived' && (
                            <Link
                              href={`/shop/${product.slug}`}
                              target="_blank"
                              className="p-2 text-foreground/60 hover:text-foreground hover:bg-secondary/60 rounded-sm transition-colors"
                              title="View Storefront"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-foreground/60 hover:text-foreground hover:bg-secondary/60 rounded-sm transition-colors"
                            title="Edit Item"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            disabled={deletingId === product.id}
                            className="p-2 text-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Card view */}
        <div className="lg:hidden divide-y divide-border/10 text-xs">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-foreground/45 uppercase font-bold tracking-widest">
              No products found matching criteria
            </div>
          ) : (
            filteredProducts.map((product) => {
              const primaryImg = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=100'
              return (
                <div key={product.id} className="p-4 space-y-4 hover:bg-secondary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-12 overflow-hidden bg-secondary border border-border/10 rounded-sm flex-shrink-0">
                      <Image
                        src={primaryImg}
                        alt={product.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold uppercase tracking-wider block truncate">
                          {product.title}
                        </span>
                        <span className="font-black text-sm">
                          {currencySymbol}{product.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-foreground/60 uppercase font-semibold">
                          {product.brand?.name || 'Generic'} • {product.size || 'OS'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            product.status === 'available'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/15'
                              : product.status === 'sold'
                              ? 'bg-destructive/10 text-destructive border border-destructive/15'
                              : product.status === 'reserved'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                              : 'bg-foreground/10 text-foreground/70'
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/5">
                    <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">
                      Views: {product.view_count}
                    </span>
                    <div className="flex items-center gap-2">
                      {product.status !== 'draft' && product.status !== 'archived' && (
                        <Link
                          href={`/shop/${product.slug}`}
                          target="_blank"
                          className="p-2 border border-border/30 rounded-sm hover:bg-secondary/40 text-foreground/60"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 border border-border/30 rounded-sm hover:bg-secondary/40 text-foreground/60"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deletingId === product.id}
                        className="p-2 border border-border/30 rounded-sm hover:bg-destructive/10 hover:text-destructive text-foreground/40 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
