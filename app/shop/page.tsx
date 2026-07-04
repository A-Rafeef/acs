import { Suspense } from 'react'
import { getProducts, type ProductFilters } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import FilterPanel from '@/components/shop/FilterPanel'
import SortDropdown from '@/components/shop/SortDropdown'
import ProductCard from '@/components/shop/ProductCard'

export const revalidate = 60 // ISR revalidation: 1 minute for product updates

const ITEMS_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    condition?: string;
    size?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
    page?: string;
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

  // Pagination (#13)
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1)
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
          <Suspense fallback={<div className="h-6 w-32 bg-secondary/40 animate-pulse rounded-sm" />}>
            <SortDropdown />
          </Suspense>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="hidden md:block">
          <Suspense fallback={<div className="w-64 space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-secondary/30 animate-pulse rounded-sm" />)}</div>}>
            <FilterPanel categories={categories} brands={brands} />
          </Suspense>
        </div>

        {/* Mobile Filter Summary / Toggle */}
        <div className="block md:hidden border-b border-border/10 pb-4">
          <details className="group">
            <summary className="list-none text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer py-2">
              <span>Toggle Filters</span>
              <span className="text-foreground/45 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pt-4 animate-fade-in">
              <Suspense fallback={<div className="h-48 bg-secondary/30 animate-pulse rounded-sm" />}>
                <FilterPanel categories={categories} brands={brands} />
              </Suspense>
            </div>
          </details>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
          {paginatedProducts.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center text-center space-y-4">
              <span className="text-lg font-semibold uppercase tracking-wide">No items found</span>
              <p className="text-xs text-foreground/45 max-w-xs">
                We couldn&apos;t find any active thrift pieces matching your selected criteria. Try resetting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 sm:gap-y-12">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls (#13) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const params = new URLSearchParams()
                    if (resolvedParams.category) params.set('category', resolvedParams.category)
                    if (resolvedParams.brand) params.set('brand', resolvedParams.brand)
                    if (resolvedParams.condition) params.set('condition', resolvedParams.condition)
                    if (resolvedParams.size) params.set('size', resolvedParams.size)
                    if (resolvedParams.sort) params.set('sort', resolvedParams.sort)
                    if (page > 1) params.set('page', String(page))
                    const href = `/shop${params.toString() ? `?${params.toString()}` : ''}`

                    return (
                      <a
                        key={page}
                        href={href}
                        className={`min-w-[36px] h-9 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-all ${
                          page === currentPage
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border/30 text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {page}
                      </a>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
