import Link from 'next/link'
import { ShoppingBag, FolderOpen, Tags, Users, Eye, ArrowUpRight } from 'lucide-react'
import { getProducts } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import { isMockMode, readMockDb } from '@/lib/data/mock-engine'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0 // Disable cache for admin dashboard

export default async function DashboardPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands()
  ])

  // Fetch waitlist count dynamically
  let waitlistCount = 0
  let recentWaitlist: any[] = []

  if (isMockMode()) {
    const db = readMockDb()
    waitlistCount = db.waitlist?.length || 0
    recentWaitlist = db.waitlist?.slice(-5).reverse() || []
  } else {
    const supabase = await createClient()
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
    waitlistCount = count || 0

    const { data } = await supabase
      .from('waitlist')
      .select(`
        *,
        product:products(title, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    recentWaitlist = data || []
  }

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  const totalProducts = products.length
  const availableProducts = products.filter((p) => p.status === 'available').length
  const soldProducts = products.filter((p) => p.status === 'sold').length
  const totalRevenue = products
    .filter((p) => p.status === 'sold')
    .reduce((sum, p) => sum + p.price, 0)

  const stats = [
    { name: 'Total Revenue', value: `${currencySymbol}${totalRevenue.toLocaleString()}`, icon: Eye, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Available Items', value: availableProducts, icon: ShoppingBag, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Sold Items', value: soldProducts, icon: ShoppingBag, color: 'text-rose-500 bg-rose-500/10' },
    { name: 'Categories / Brands', value: `${categories.length} / ${brands.length}`, icon: FolderOpen, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Waitlist Requests', value: waitlistCount, icon: Users, color: 'text-purple-500 bg-purple-500/10' },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/10 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Overview Control
        </span>
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Admin Dashboard {isMockMode() && '(MOCK LOCAL)'}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="border border-border/30 p-5 rounded-md bg-secondary/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/45">
                  {stat.name}
                </span>
                <div className={`p-2 rounded-sm ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xl font-black tracking-tight">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Detail grids */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Recent Products */}
        <div className="lg:col-span-8 border border-border/30 p-6 rounded-md bg-secondary/5 space-y-6">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Recent Inventory Additions
            </h2>
            <Link
              href="/products"
              className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              Manage Catalog <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/10 text-foreground/45 text-[9px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Size / Cond</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="py-3 px-4 font-semibold uppercase">{p.title}</td>
                    <td className="py-3 px-4 uppercase text-foreground/60">{p.size || 'OS'} / {p.condition}</td>
                    <td className="py-3 px-4 font-bold">{currencySymbol}{p.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        p.status === 'available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        p.status === 'reserved' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        p.status === 'sold' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Waitlist Notifications */}
        <div className="lg:col-span-4 border border-border/30 p-6 rounded-md bg-secondary/5 space-y-6">
          <div className="border-b border-border/20 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Waitlist Activity
            </h2>
          </div>

          <div className="space-y-4">
            {recentWaitlist.length > 0 ? (
              recentWaitlist.map((wl) => (
                <div key={wl.id} className="text-xs space-y-1 p-3 rounded bg-secondary/10 border border-border/10">
                  <div className="flex justify-between items-center text-[9px] text-foreground/45 font-bold uppercase">
                    <span>{new Date(wl.created_at).toLocaleDateString()}</span>
                    <span className="text-amber-600 dark:text-amber-400">Request</span>
                  </div>
                  <p className="font-semibold text-foreground truncate">{wl.email}</p>
                  <p className="text-[10px] text-foreground/60 truncate uppercase">
                    Product: {wl.product?.title || 'Unknown Piece'}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-foreground/35 uppercase">
                No active waitlist requests.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
