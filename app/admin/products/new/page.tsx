import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0

export default async function NewProductPage() {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    redirect('/admin/login')
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
            New Drop
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Create a new 1-of-1 sustainable thrift product listing
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm categories={categories} brands={brands} />
    </div>
  )
}
