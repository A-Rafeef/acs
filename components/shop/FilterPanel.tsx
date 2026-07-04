'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type Category, type Brand } from '@/types'
import { SlidersHorizontal } from 'lucide-react'

interface FilterPanelProps {
  categories: Category[];
  brands: Brand[];
}

export default function FilterPanel({ categories, brands }: FilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') || ''
  const activeBrand = searchParams.get('brand') || ''
  const activeCondition = searchParams.get('condition') || ''
  const activeSize = searchParams.get('size') || ''

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS']
  const conditions = [
    { label: 'New', value: 'new' },
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' }
  ]

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/shop?${params.toString()}`, { scroll: false })
  }

  const clearAllFilters = () => {
    router.push('/shop', { scroll: false })
  }

  const hasActiveFilters = activeCategory || activeBrand || activeCondition || activeSize

  return (
    <div className="space-y-8 flex-shrink-0 w-full md:w-64">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-border/25">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[10px] uppercase font-bold text-foreground/45 hover:text-foreground transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
          Categories
        </h4>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => updateFilter('category', '')}
            className={`text-xs text-left uppercase tracking-wide transition-colors ${
              !activeCategory ? 'font-bold text-foreground' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`text-xs text-left uppercase tracking-wide transition-colors ${
                activeCategory === cat.slug ? 'font-bold text-foreground' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
          Brands
        </h4>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => updateFilter('brand', '')}
            className={`text-xs text-left uppercase tracking-wide transition-colors ${
              !activeBrand ? 'font-bold text-foreground' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            All Brands
          </button>
          {brands.map((br) => (
            <button
              key={br.id}
              onClick={() => updateFilter('brand', br.slug)}
              className={`text-xs text-left uppercase tracking-wide transition-colors ${
                activeBrand === br.slug ? 'font-bold text-foreground' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {br.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
          Size
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((sz) => (
            <button
              key={sz}
              onClick={() => updateFilter('size', activeSize === sz ? '' : sz)}
              className={`border text-[10px] font-bold uppercase py-2 transition-all rounded-sm flex items-center justify-center ${
                activeSize === sz
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border/30 hover:border-foreground/40 text-foreground/70'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
          Condition
        </h4>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => updateFilter('condition', '')}
            className={`text-xs text-left uppercase tracking-wide transition-colors ${
              !activeCondition ? 'font-bold text-foreground' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            All Conditions
          </button>
          {conditions.map((cond) => (
            <button
              key={cond.value}
              onClick={() => updateFilter('condition', cond.value)}
              className={`text-xs text-left uppercase tracking-wide transition-colors ${
                activeCondition === cond.value ? 'font-bold text-foreground' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
