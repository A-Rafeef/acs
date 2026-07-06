'use client'

import { useState, useMemo } from 'react'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import ProductCard from '@/components/shop/ProductCard'
import ShopBySize from '@/components/home/ShopBySize'
import AnimateOnScroll from '@/components/home/AnimateOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/home/AnimateOnScroll'
import { type Product } from '@/types'

interface SizeFilteredSectionsProps {
  newArrivals: Product[]
  featuredProducts: Product[]
}

export default function SizeFilteredSections({ newArrivals, featuredProducts }: SizeFilteredSectionsProps) {
  const [sizeFilter, setSizeFilter] = useState<string | null>(null)

  const filteredArrivals = useMemo(() => {
    if (!sizeFilter) return newArrivals
    return newArrivals.filter((p) => p.size?.toUpperCase() === sizeFilter.toUpperCase())
  }, [newArrivals, sizeFilter])

  const filteredPicks = useMemo(() => {
    if (!sizeFilter) return featuredProducts
    return featuredProducts.filter((p) => p.size?.toUpperCase() === sizeFilter.toUpperCase())
  }, [featuredProducts, sizeFilter])

  return (
    <>
      {/* Size Filter Bar */}
      <ShopBySize onSizeChange={setSizeFilter} />

      {/* New Arrivals (filtered) */}
      {filteredArrivals.length > 0 ? (
        <NewArrivalsCarousel products={filteredArrivals} />
      ) : sizeFilter ? (
        <div className="py-16 bg-secondary/10 text-center text-xs text-foreground/45 space-y-2">
          <p>No new arrivals in size <strong className="text-foreground/70">{sizeFilter}</strong>.</p>
          <button
            onClick={() => setSizeFilter(null)}
            className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="py-16 bg-secondary/10 text-center text-xs text-foreground/45">
          No new arrivals listed yet. Check back soon.
        </div>
      )}

      {/* Curator's Picks (filtered) */}
      {filteredPicks.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 border-t border-border/10">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                Handpicked Items
              </span>
              <h2 className="text-2xl font-black uppercase tracking-wide">
                Curator&apos;s Picks
              </h2>
              <div className="mx-auto h-[1.5px] w-12 bg-foreground" />
            </div>
          </AnimateOnScroll>

          <StaggerContainer
            className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
            staggerDelay={0.08}
          >
            {filteredPicks.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {sizeFilter && filteredPicks.length === 0 && featuredProducts.length > 0 && (
        <div className="py-16 text-center text-xs text-foreground/45 space-y-2 border-t border-border/10">
          <p>No curator&apos;s picks in size <strong className="text-foreground/70">{sizeFilter}</strong>.</p>
          <button
            onClick={() => setSizeFilter(null)}
            className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Show all sizes
          </button>
        </div>
      )}
    </>
  )
}
