'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSort = searchParams.get('sort') || 'newest'

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'newest') {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    router.push(`/shop?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center space-x-2 text-xs">
      <span className="text-foreground/45 uppercase tracking-wider font-bold text-[9px]">Sort By</span>
      <select
        value={activeSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-transparent border-b border-foreground/10 pb-1 outline-none font-bold uppercase tracking-wider text-foreground cursor-pointer text-[10px]"
      >
        <option value="newest">Newest Drops</option>
        <option value="price_asc">Price: Low - High</option>
        <option value="price_desc">Price: High - Low</option>
      </select>
    </div>
  )
}
