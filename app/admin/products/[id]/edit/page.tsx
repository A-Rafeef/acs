import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import { adminGetProductById } from '@/lib/data/admin-products'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    redirect('/admin/login')
  }

  const { id } = await params
  const product = await adminGetProductById(id)

  if (!product) {
    notFound()
  }

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ])

  return (
    <div className="space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide">
            Edit Drop
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Modify product data or status for &quot;{product.title}&quot;
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm initialData={product} categories={categories} brands={brands} />
    </div>
  )
}
