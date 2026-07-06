import ProductForm from '@/components/admin/ProductForm'
import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import { createProductAction } from '@/app/actions/admin-products'

export const revalidate = 0 // Disable cache for updates

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands()
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/10 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Inventory Control
        </span>
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Add New Product
        </h1>
      </div>

      {/* Form */}
      <ProductForm
        categories={categories}
        brands={brands}
        onSubmitAction={createProductAction}
      />
    </div>
  )
}
