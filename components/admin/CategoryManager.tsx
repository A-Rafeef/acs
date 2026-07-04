'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { type Category } from '@/types'
import { createCategoryAction, deleteCategoryAction } from '@/app/actions/admin-metadata'
import { toast } from 'sonner'

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auto slug generation
  useEffect(() => {
    const generated = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setSlug(generated)
  }, [name])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const res = await createCategoryAction(name, slug)
      if (res.success && res.data) {
        setCategories((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
        setName('')
        toast.success(`Category "${name}" created`)
      } else {
        toast.error(res.error || 'Failed to create category')
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete "${catName}"? This will unlink categories from related products.`)) return

    setDeletingId(id)
    try {
      const res = await deleteCategoryAction(id)
      if (res.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id))
        toast.success(`Category "${catName}" deleted`)
      } else {
        toast.error(res.error || 'Failed to delete category')
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* List column */}
      <div className="md:col-span-2 space-y-4">
        <div className="border border-border/30 rounded-sm overflow-hidden bg-secondary/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-[9px] uppercase tracking-wider font-bold border-b border-border/30">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-foreground/45">
                    No categories seeded.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-bold uppercase tracking-wider text-foreground">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-foreground/55">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deletingId === cat.id}
                        className="p-1 text-foreground/40 hover:text-destructive transition-colors rounded-sm hover:bg-destructive/5"
                      >
                        {deletingId === cat.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add column */}
      <div className="border border-border/30 p-6 rounded-sm bg-secondary/5 h-fit space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider">
          Create Category
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="name">
              Category Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Outerwear"
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="outerwear"
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground text-background text-xs font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-foreground/80 transition-colors rounded-sm"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Category
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
