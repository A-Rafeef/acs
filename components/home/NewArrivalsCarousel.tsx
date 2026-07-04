'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'

interface NewArrivalsCarouselProps {
  products: Product[];
}

export default function NewArrivalsCarousel({ products }: NewArrivalsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.75
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-20 bg-secondary/20 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Block with navigation buttons */}
        <div className="flex items-end justify-between border-b border-border/20 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Fresh Dropped Pieces
            </span>
            <h2 className="text-2xl font-black uppercase tracking-wide">
              New Arrivals
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScroll('left')}
              className="rounded-full p-2 border border-border bg-background hover:bg-secondary transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="rounded-full p-2 border border-border bg-background hover:bg-secondary transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Overflow Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
