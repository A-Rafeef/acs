import { getCategories } from '@/lib/data/categories'
import CategoryManager from '@/components/admin/CategoryManager'

export const revalidate = 0 // Do not cache

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-8 w-full animate-fade-in">
      {/* Title */}
      <div className="border-b border-border/25 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Categories
        </h1>
        <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
          Garment Groupings
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  )
}
