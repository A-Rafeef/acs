import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import ProductForm from '@/components/admin/ProductForm'
import { createProductAction } from '@/app/actions/admin-products'

export const revalidate = 0 // Do not cache

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands()
  ])

  return (
    <div className="space-y-8 w-full animate-fade-in">
      {/* Title */}
      <div className="border-b border-border/25 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Add Product
        </h1>
        <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
          Publish a new unique 1-of-1 piece to the catalog
        </p>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        onSubmitAction={createProductAction}
      />
    </div>
  )
}
