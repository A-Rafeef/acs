import { getProducts, type ProductFilters } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import FilterPanel from '@/components/shop/FilterPanel'
import SortDropdown from '@/components/shop/SortDropdown'
import ProductCard from '@/components/shop/ProductCard'

export const revalidate = 60 // ISR revalidation: 1 minute for product updates

interface PageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    condition?: string;
    size?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
  }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  
  const filters: ProductFilters = {
    categorySlug: resolvedParams.category,
    brandSlug: resolvedParams.brand,
    condition: resolvedParams.condition,
    size: resolvedParams.size,
    sort: resolvedParams.sort,
    status: 'available', // Public sees only available items on the active catalog
  }

  // Parallel data fetching
  const [products, categories, brands] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Page Title & Sort Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/25 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide">
            Catalog
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Available Curated Pieces ({products.length})
          </p>
        </div>
        <div className="flex items-center justify-end">
          <SortDropdown />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="hidden md:block">
          <FilterPanel categories={categories} brands={brands} />
        </div>

        {/* Mobile Filter Summary / Toggle could be handled easily. For now, inline responsive block: */}
        <div className="block md:hidden border-b border-border/10 pb-4">
          <details className="group">
            <summary className="list-none text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer py-2">
              <span>Toggle Filters</span>
              <span className="text-foreground/45 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pt-4 animate-fade-in">
              <FilterPanel categories={categories} brands={brands} />
            </div>
          </details>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
          {products.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center text-center space-y-4">
              <span className="text-lg font-semibold uppercase tracking-wide">No items found</span>
              <p className="text-xs text-foreground/45 max-w-xs">
                We couldn&apos;t find any active thrift pieces matching your selected criteria. Try resetting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 sm:gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
