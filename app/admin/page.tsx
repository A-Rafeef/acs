import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { adminGetAllProducts } from '@/lib/data/admin-products'
import { adminGetWaitlist } from '@/lib/data/waitlist'
import {
  ShoppingBag,
  DollarSign,
  Users,
  AlertCircle,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboard() {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    redirect('/admin/login')
  }

  const [products, waitlist] = await Promise.all([
    adminGetAllProducts(),
    adminGetWaitlist()
  ])

  // Stat computations
  const totalCount = products.length
  const availableCount = products.filter((p) => p.status === 'available').length
  const reservedCount = products.filter((p) => p.status === 'reserved').length
  const soldCount = products.filter((p) => p.status === 'sold').length
  const draftCount = products.filter((p) => p.status === 'draft').length

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  const availableValue = products
    .filter((p) => p.status === 'available')
    .reduce((sum, p) => sum + Number(p.price), 0)

  const totalSalesValue = products
    .filter((p) => p.status === 'sold')
    .reduce((sum, p) => sum + Number(p.price), 0)

  const recentProducts = products.slice(0, 5)
  const recentWaitlist = waitlist.slice(0, 5)

  const stats = [
    {
      name: 'Total Inventory',
      value: totalCount,
      description: `${availableCount} available, ${draftCount} drafts`,
      icon: ShoppingBag,
    },
    {
      name: 'Total Sales',
      value: `${currencySymbol}${totalSalesValue.toLocaleString()}`,
      description: `From ${soldCount} unique sold items`,
      icon: DollarSign,
    },
    {
      name: 'Catalog Value',
      value: `${currencySymbol}${availableValue.toLocaleString()}`,
      description: 'Active available listing value',
      icon: Eye,
    },
    {
      name: 'Waitlist Entries',
      value: waitlist.length,
      description: 'High intent buyers waiting',
      icon: Users,
    }
  ]

  return (
    <div className="space-y-10">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Real-time status overview of ACS
          </p>
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest px-4 py-3 hover:bg-foreground/80 transition-colors rounded-sm"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="border border-border/15 p-6 rounded-sm bg-secondary/5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/45">
                  {stat.name}
                </span>
                <Icon className="h-4 w-4 text-foreground/40" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
              </div>
              <p className="mt-1 text-[10px] font-semibold text-foreground/45 uppercase tracking-wider">
                {stat.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Main Section Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Inventory */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-border/25 pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider">Recent Items</h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/45 hover:text-foreground transition-colors"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="border border-border/15 rounded-sm overflow-hidden divide-y divide-border/10 bg-secondary/5">
            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-foreground/45 uppercase font-bold">
                No items in inventory
              </div>
            ) : (
              recentProducts.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between text-xs hover:bg-secondary/10 transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider block">
                      {product.title}
                    </span>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/45 uppercase tracking-widest">
                      <span>{product.brand?.name || 'Generic'}</span>
                      <span>•</span>
                      <span>{currencySymbol}{product.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        product.status === 'available'
                          ? 'bg-green-500/10 text-green-500'
                          : product.status === 'sold'
                          ? 'bg-destructive/10 text-destructive'
                          : product.status === 'reserved'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-foreground/10 text-foreground/60'
                      }`}
                    >
                      {product.status}
                    </span>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-[10px] font-bold uppercase tracking-widest border border-border/40 px-2.5 py-1 hover:bg-foreground hover:text-background hover:border-foreground transition-all rounded-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Waitlist Inquiries */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-border/25 pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider">Waitlist Activity</h2>
            <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-widest">
              High Intent Requests
            </span>
          </div>

          <div className="border border-border/15 rounded-sm overflow-hidden divide-y divide-border/10 bg-secondary/5">
            {recentWaitlist.length === 0 ? (
              <div className="p-8 text-center text-xs text-foreground/45 uppercase font-bold">
                No active waitlist requests
              </div>
            ) : (
              recentWaitlist.map((entry) => (
                <div key={entry.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold uppercase tracking-wider">{entry.email}</p>
                      {entry.phone && (
                        <p className="text-[10px] font-medium text-foreground/45">{entry.phone}</p>
                      )}
                    </div>
                    <span className="text-[9px] font-semibold text-foreground/45 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="bg-secondary/20 p-2 rounded-sm border border-border/10">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-foreground/45 block">
                      Requested Item
                    </span>
                    <span className="font-bold uppercase text-[10px]">
                      {entry.product?.title || 'Unknown product'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
