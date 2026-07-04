import { createClient } from '@/lib/supabase/server'
import { isMockMode, readMockDb } from '@/lib/data/mock-engine'
import { TrendingUp, ShoppingBag, Eye, Users } from 'lucide-react'

export const revalidate = 0 // Do not cache dashboard page

export default async function AdminDashboardPage() {
  let totalProducts = 0
  let soldProducts = 0
  let reservedProducts = 0
  let availableProducts = 0
  let waitlistCount = 0
  let totalViews = 0
  const categoryCounts: { [key: string]: number } = {}

  if (isMockMode()) {
    const db = readMockDb()
    totalProducts = db.products.length
    soldProducts = db.products.filter((p: any) => p.status === 'sold').length
    reservedProducts = db.products.filter((p: any) => p.status === 'reserved').length
    availableProducts = db.products.filter((p: any) => p.status === 'available').length
    waitlistCount = db.waitlist.length
    totalViews = db.products.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)

    db.products.forEach((p: any) => {
      if (p.status !== 'archived') {
        const cat = db.categories.find((c: any) => c.id === p.category_id)
        const catName = cat?.name || 'Uncategorized'
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
      }
    })
  } else {
    const supabase = await createClient()

    // Fetch KPI data in parallel from Supabase
    const [
      totalRes,
      soldRes,
      reservedRes,
      availableRes,
      viewsRes,
      waitlistRes,
      productsWithCategoriesRes
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'reserved'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('products').select('view_count'),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('id, category:categories(name)').neq('status', 'archived')
    ])

    totalProducts = totalRes.count || 0
    soldProducts = soldRes.count || 0
    reservedProducts = reservedRes.count || 0
    availableProducts = availableRes.count || 0
    waitlistCount = waitlistRes.count || 0
    totalViews = viewsRes.data?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0

    productsWithCategoriesRes.data?.forEach((row: any) => {
      const catName = row.category?.name || 'Uncategorized'
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
    })
  }

  // Calculate metrics
  const sellThroughRate = totalProducts > 0 ? (soldProducts / totalProducts) * 100 : 0
  const inquiryRatio = waitlistCount > 0 ? totalViews / waitlistCount : 0

  return (
    <div className="space-y-8 w-full">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-border/25 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Analytics Overview {isMockMode() && '(MOCK LOCAL DATABASE)'}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="border border-border/30 p-6 bg-secondary/5 space-y-2 rounded-sm">
          <div className="flex justify-between items-center text-foreground/50">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Products</span>
            <ShoppingBag className="h-4 w-4" />
          </div>
          <p className="text-3xl font-black">{totalProducts}</p>
          <div className="flex gap-3 text-[10px] text-foreground/50">
            <span>{availableProducts} Avail</span>
            <span>{soldProducts} Sold</span>
            <span>{reservedProducts} Res</span>
          </div>
        </div>

        {/* Sell-Through Rate */}
        <div className="border border-border/30 p-6 bg-secondary/5 space-y-2 rounded-sm">
          <div className="flex justify-between items-center text-foreground/50">
            <span className="text-[10px] uppercase font-bold tracking-wider">Sell-Through Rate</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-3xl font-black">{sellThroughRate.toFixed(1)}%</p>
          <p className="text-[9px] text-foreground/40 leading-none">Percentage of catalog items sold</p>
        </div>

        {/* Total Views */}
        <div className="border border-border/30 p-6 bg-secondary/5 space-y-2 rounded-sm">
          <div className="flex justify-between items-center text-foreground/50">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Views</span>
            <Eye className="h-4 w-4" />
          </div>
          <p className="text-3xl font-black">{totalViews.toLocaleString()}</p>
          <p className="text-[9px] text-foreground/40 leading-none">Aggregated page views across active drops</p>
        </div>

        {/* View-To-Inquiry Ratio */}
        <div className="border border-border/30 p-6 bg-secondary/5 space-y-2 rounded-sm">
          <div className="flex justify-between items-center text-foreground/50">
            <span className="text-[10px] uppercase font-bold tracking-wider">Waitlist Entries</span>
            <Users className="h-4 w-4" />
          </div>
          <p className="text-3xl font-black">{waitlistCount}</p>
          <p className="text-[9px] text-foreground/40 leading-none">
            {inquiryRatio > 0 ? `${inquiryRatio.toFixed(0)} views per waitlist signup` : 'No inquiries logged'}
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category distribution */}
        <div className="border border-border/30 p-6 rounded-sm bg-secondary/5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Category Distribution
          </h3>
          <div className="space-y-4">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-foreground/45">No category distributions to display.</p>
            ) : (
              Object.entries(categoryCounts).map(([name, count]) => {
                const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0
                return (
                  <div key={name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{name}</span>
                      <span className="text-foreground/50">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-sm overflow-hidden">
                      <div
                        className="bg-foreground h-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Quick Tips or Info */}
        <div className="border border-border/30 p-6 rounded-sm bg-secondary/5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Admin Quick Guide
          </h3>
          <div className="text-xs text-foreground/60 leading-relaxed space-y-3 font-light">
            <p>
              • **Status Machine**: Set product status to `available` to publish it to the catalog. Set to `reserved` to temporarily hold items for buyers. Marking an item `sold` automatically presents the Waitlist Form on the product detail page.
            </p>
            <p>
              • **Direct R2 Image Upload**: Forms support direct uploads to Cloudflare R2 via presigned URLs. Large images are processed and compressed to high-efficiency WebP format in the browser before transfer, maintaining high fidelity and speed.
            </p>
            <p>
              • **Automated Purge**: Items marked `sold` for more than 30 days are automatically archived. Their media payloads are safely wiped from the Cloudflare R2 bucket during the daily 2AM UTC maintenance cron.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
