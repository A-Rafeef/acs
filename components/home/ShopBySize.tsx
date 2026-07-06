'use client'

import { useState, useEffect } from 'react'
import AnimateOnScroll from './AnimateOnScroll'

interface ShopBySizeProps {
  onSizeChange: (size: string | null) => void
  initialSize?: string | null
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS']

export default function ShopBySize({ onSizeChange, initialSize = null }: ShopBySizeProps) {
  const [activeSize, setActiveSize] = useState<string | null>(initialSize)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSelect = (size: string) => {
    const newSize = activeSize === size ? null : size
    setActiveSize(newSize)
    onSizeChange(newSize)
  }

  return (
    <AnimateOnScroll variant="fade-up">
      <div className="py-6 border-b border-border/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45 whitespace-nowrap">
              Shop by Size
            </span>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSelect(size)}
                  className={`min-w-[40px] px-3 py-2 text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-all duration-200 ${
                    activeSize === size
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'border-border/30 text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {size}
                </button>
              ))}
              {activeSize && (
                <button
                  onClick={() => { setActiveSize(null); onSizeChange(null) }}
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/45 hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  )
}
