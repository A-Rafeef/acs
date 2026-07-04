import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import ProductForm from '@/components/admin/ProductForm'
import { updateProductAction } from '@/app/actions/admin-products'
import { type Product } from '@/types'
import { isMockMode, readMockDb } from '@/lib/data/mock-engine'

export const revalidate = 0 // Do not cache

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const resolvedParams = await params
  const id = resolvedParams.id

  let product: Product | null = null
  
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands()
  ])

  if (isMockMode()) {
    const db = readMockDb()
    const found = db.products.find((p: any) => p.id === id)
    if (found) {
      product = {
        ...found,
        category: db.categories.find((c: any) => c.id === found.category_id) || null,
        brand: db.brands.find((b: any) => b.id === found.brand_id) || null
      } as Product
    }
  } else {
    const supabase = await createClient()

    const { data } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .eq('id', id)
      .maybeSingle()
      
    product = data as Product
  }

  if (!product) {
    notFound()
  }

  // Bind the product ID to the update server action
  const boundUpdateAction = updateProductAction.bind(null, id)

  return (
    <div className="space-y-8 w-full animate-fade-in">
      {/* Title */}
      <div className="border-b border-border/25 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Edit Product
        </h1>
        <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
          Modify details for &quot;{product.title}&quot; {isMockMode() && '(MOCK LOCAL DATABASE)'}
        </p>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        initialData={product}
        onSubmitAction={boundUpdateAction}
      />
    </div>
  )
}
