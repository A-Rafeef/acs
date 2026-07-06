import CategoryManager from '@/components/admin/CategoryManager'
import { getCategories } from '@/lib/data/categories'

export const revalidate = 0 // Disable cache for update views

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 border-b border-border/10 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Categories Control
        </span>
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Manage Categories
        </h1>
      </div>

      {/* Manager Grid */}
      <CategoryManager initialCategories={categories} />
    </div>
  )
}
