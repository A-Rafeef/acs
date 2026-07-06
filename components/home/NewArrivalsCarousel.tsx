'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'
import AnimateOnScroll from './AnimateOnScroll'

interface NewArrivalsCarouselProps {
  products: Product[];
}

export default function NewArrivalsCarousel({ products }: NewArrivalsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Pointer-based drag scrolling state
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollStartLeft = useRef(0)
  const hasMoved = useRef(false)

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

  // Update scroll progress bar
  const updateScrollProgress = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollLeft, scrollWidth, clientWidth } = container
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll <= 0) {
      setScrollProgress(0)
      return
    }
    setScrollProgress(scrollLeft / maxScroll)
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener('scroll', updateScrollProgress, { passive: true })
    updateScrollProgress()
    return () => container.removeEventListener('scroll', updateScrollProgress)
  }, [updateScrollProgress])

  // Pointer drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const container = scrollContainerRef.current
    if (!container) return
    isDragging.current = true
    hasMoved.current = false
    startX.current = e.clientX
    scrollStartLeft.current = container.scrollLeft
    container.setPointerCapture(e.pointerId)
    container.style.cursor = 'grabbing'
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const container = scrollContainerRef.current
    if (!container) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 3) hasMoved.current = true
    container.scrollLeft = scrollStartLeft.current - dx
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false
    const container = scrollContainerRef.current
    if (!container) return
    container.releasePointerCapture(e.pointerId)
    container.style.cursor = 'grab'
  }, [])

  // Prevent click navigation when dragging
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  if (!products || products.length === 0) return null

  return (
    <AnimateOnScroll variant="fade-up">
      <section id="new-arrivals" className="py-20 bg-secondary/20 transition-colors">
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
                className="rounded-full p-2.5 border border-border bg-background hover:bg-secondary transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="rounded-full p-2.5 border border-border bg-background hover:bg-secondary transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Overflow Scroll Container with Drag */}
          <div
            ref={scrollContainerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClickCapture={onClickCapture}
            className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory cursor-grab select-none"
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

          {/* Scroll Progress Bar */}
          <div className="relative h-0.5 w-full bg-border/30 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-foreground/60 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${Math.max(10, (1 / Math.max(products.length - 2, 1)) * 100)}%`, transform: `translateX(${scrollProgress * ((products.length - 2) * 100)}%)` }}
            />
          </div>
        </div>
      </section>
    </AnimateOnScroll>
  )
}
