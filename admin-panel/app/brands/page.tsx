import BrandManager from '@/components/admin/BrandManager'
import { getBrands } from '@/lib/data/brands'

export const revalidate = 0 // Disable cache for update views

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/10 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Brands Control
        </span>
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Manage Brands
        </h1>
      </div>

      {/* Manager Grid */}
      <BrandManager initialBrands={brands} />
    </div>
  )
}
