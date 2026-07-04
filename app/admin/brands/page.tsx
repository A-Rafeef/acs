import { getBrands } from '@/lib/data/brands'
import BrandManager from '@/components/admin/BrandManager'

export const revalidate = 0 // Do not cache

export default async function AdminBrandsPage() {
  const brands = await getBrands()

  return (
    <div className="space-y-8 w-full animate-fade-in">
      {/* Title */}
      <div className="border-b border-border/25 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Brands
        </h1>
        <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
          Curated Designers
        </p>
      </div>

      <BrandManager initialBrands={brands} />
    </div>
  )
}
