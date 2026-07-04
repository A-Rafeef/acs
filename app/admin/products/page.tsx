import { createClient } from '@/lib/supabase/server'
import ProductListTable from '@/components/admin/ProductListTable'
import { type Product } from '@/types'
import { isMockMode, readMockDb } from '@/lib/data/mock-engine'

export const revalidate = 0 // Do not cache

export default async function AdminProductsPage() {
  let products: Product[] = []

  if (isMockMode()) {
    const db = readMockDb()
    products = db.products.map((p: any) => ({
      ...p,
      category: db.categories.find((c: any) => c.id === p.category_id) || null,
      brand: db.brands.find((b: any) => b.id === p.brand_id) || null
    }))
  } else {
    const supabase = await createClient()

    // Fetch all products with relational joins, bypassing public filters
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:categories(*),
        images:product_images(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin products:', error)
    } else {
      products = (data as Product[]) || []
    }
  }

  return (
    <div className="space-y-8 w-full animate-fade-in">
      {/* Title */}
      <div className="border-b border-border/25 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Products
        </h1>
        <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
          Inventory Control {isMockMode() && '(MOCK LOCAL DATABASE)'}
        </p>
      </div>

      <ProductListTable initialProducts={products} />
    </div>
  )
}
