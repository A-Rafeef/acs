import { adminGetAllProducts } from '@/lib/data/admin-products'
import { getCategories } from '@/lib/data/categories'
import { getBrands } from '@/lib/data/brands'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import InventoryList from '@/components/admin/InventoryList'

export const revalidate = 0

export default async function AdminProductsPage() {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    redirect('/admin/login')
  }

  const [products, categories, brands] = await Promise.all([
    adminGetAllProducts(),
    getCategories(),
    getBrands(),
  ])

  return (
    <InventoryList
      initialProducts={products}
      categories={categories}
      brands={brands}
    />
  )
}
