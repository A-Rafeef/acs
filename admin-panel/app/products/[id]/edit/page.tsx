import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import { getProductById } from '@/lib/data/products'
import { updateProductAction } from '@/app/actions/admin-products'

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0 // Disable cache for updates

export default async function EditProductPage({ params }: PageProps) {
  const resolvedParams = await params
  const product = await getProductById(resolvedParams.id)

  if (!product) {
    notFound()
  }

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands()
  ])

  // Bind product ID to update action payload
  const updateProductActionWithId = updateProductAction.bind(null, product.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/10 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Inventory Control
        </span>
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Modify Details for &quot;{product.title}&quot;
        </h1>
      </div>

      {/* Form */}
      <ProductForm
        categories={categories}
        brands={brands}
        initialData={product}
        onSubmitAction={updateProductActionWithId}
      />
    </div>
  )
}
