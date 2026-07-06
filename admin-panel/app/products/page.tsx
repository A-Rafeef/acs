import ProductListTable from '@/components/admin/ProductListTable'
import { getProducts } from '@/lib/data/products'

export const revalidate = 0 // Disable cache for catalog updates

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/10 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Inventory Catalog
        </span>
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Manage Products
        </h1>
      </div>

      {/* Table */}
      <ProductListTable initialProducts={products} />
    </div>
  )
}
