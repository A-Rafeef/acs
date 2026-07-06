'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore'
import AnimateOnScroll from './AnimateOnScroll'

export default function RecentlyViewed() {
  const { items } = useRecentlyViewedStore()
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  // Don't render on server or if no items
  if (!mounted || items.length === 0) return null

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return
    const scrollAmount = container.clientWidth * 0.6
    container.scrollTo({
      left: container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth',
    })
  }

  return (
    <AnimateOnScroll variant="fade-up">
      <section className="py-16 border-t border-border/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Your Browsing History
              </span>
              <h2 className="text-xl font-black uppercase tracking-wide">
                Recently Viewed
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleScroll('left')}
                className="rounded-full p-2 border border-border bg-background hover:bg-secondary transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="rounded-full p-2 border border-border bg-background hover:bg-secondary transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Scrolling Row */}
          <div
            ref={scrollRef}
            className="flex space-x-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <Link
                key={item.product_id}
                href={`/shop/${item.slug}`}
                className="group flex-shrink-0 w-[180px] sm:w-[200px] snap-start space-y-2"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-sm border border-border/10">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 truncate">
                    {item.title}
                  </h4>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-foreground/45 uppercase">
                      {item.brand_name || 'Curated'}
                    </span>
                    <span className="font-bold text-foreground">
                      {currencySymbol}{item.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AnimateOnScroll>
  )
}
