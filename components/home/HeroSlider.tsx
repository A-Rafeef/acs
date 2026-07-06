'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

export interface HeroSlide {
  id: string
  image: string
  subtitle: string
  titleLine1: string
  titleLine2: string
  description: string
  ctaText: string
  ctaHref: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
}

// Default slides — can be overridden via props (fetched from DB/CMS)
const defaultSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    image: '/hero_bg.png',
    subtitle: 'Premium Curated Archive',
    titleLine1: 'Curated Vintage.',
    titleLine2: 'Sustainable Luxury.',
    description: 'Curating rare, high-quality, and unique 1-of-1 designer archives and vintage garments for the modern circular wardrobe.',
    ctaText: 'Shop the Collection',
    ctaHref: '/shop',
    secondaryCtaText: 'New Arrivals',
    secondaryCtaHref: '#new-arrivals',
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=1920',
    subtitle: 'New Season Drops',
    titleLine1: 'Archival Finds.',
    titleLine2: 'One-of-a-Kind.',
    description: 'Discover handpicked designer pieces that tell a story. Each garment is authenticated, inspected, and guaranteed unique.',
    ctaText: 'Browse All',
    ctaHref: '/shop',
    secondaryCtaText: 'Our Story',
    secondaryCtaHref: '#about',
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920',
    subtitle: 'Circular Fashion Movement',
    titleLine1: 'Wear History.',
    titleLine2: 'Leave No Trace.',
    description: 'Join the sustainable fashion revolution. Zero new fabric waste. Every purchase extends a garment\'s lifecycle.',
    ctaText: 'Shop Now',
    ctaHref: '/shop',
  },
]

interface HeroSliderProps {
  slides?: HeroSlide[]
  autoPlayInterval?: number
}

export default function HeroSlider({ slides = defaultSlides, autoPlayInterval = 6000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const slideCount = slides.length

  const goToSlide = useCallback((index: number, dir?: number) => {
    setDirection(dir ?? (index > currentIndex ? 1 : -1))
    setCurrentIndex(index)
  }, [currentIndex])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  // Auto-play
  useEffect(() => {
    if (isPaused || slideCount <= 1) return
    timerRef.current = setInterval(goNext, autoPlayInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, goNext, autoPlayInterval, slideCount])

  const currentSlide = slides[currentIndex]

  // Swipe support
  const touchStartX = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx > 0) goPrev()
      else goNext()
    }
  }

  // Slide transition variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '8%' : '-8%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-8%' : '8%',
      opacity: 0,
    }),
  }

  return (
    <div
      className="relative min-h-[85vh] max-h-[900px] w-full overflow-hidden bg-zinc-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images with cross-fade */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={currentSlide.image}
            alt={currentSlide.titleLine1}
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="object-cover object-center opacity-65 dark:opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text Content */}
      <div className="relative z-10 min-h-[85vh] max-h-[900px] flex items-center justify-start px-4 sm:px-6 lg:px-12">
        <div className="max-w-2xl text-left text-white space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide.id}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-300">
                {currentSlide.subtitle}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] font-sans">
                {currentSlide.titleLine1} <br />
                <span className="text-zinc-400">{currentSlide.titleLine2}</span>
              </h1>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="text-sm sm:text-base leading-relaxed text-zinc-300 max-w-lg font-light"
            >
              {currentSlide.description}
            </motion.p>
          </AnimatePresence>

          {/* Urgency micro-copy */}
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
              Updated daily · Every piece is 1-of-1
            </span>
          </div>

          {/* CTAs */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`cta-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="pt-2 flex flex-wrap gap-3"
            >
              <Link
                href={currentSlide.ctaHref}
                className="group inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest px-8 py-4 transition-all duration-300 rounded-sm shadow-md"
              >
                {currentSlide.ctaText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {currentSlide.secondaryCtaText && currentSlide.secondaryCtaHref && (
                <Link
                  href={currentSlide.secondaryCtaHref}
                  className="group inline-flex items-center gap-2 bg-transparent text-white border border-white/30 hover:border-white/60 hover:bg-white/10 text-xs font-bold uppercase tracking-widest px-8 py-4 transition-all duration-300 rounded-sm"
                >
                  {currentSlide.secondaryCtaText}
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slideCount > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all border border-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all border border-white/10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot Indicators + Progress */}
      {slideCount > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              className="relative h-2 rounded-full transition-all duration-500 overflow-hidden"
              style={{ width: idx === currentIndex ? 32 : 8 }}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span className="absolute inset-0 rounded-full bg-white/30" />
              {idx === currentIndex && (
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                  key={`progress-${currentIndex}`}
                />
              )}
              {idx !== currentIndex && (
                <span className="absolute inset-0 rounded-full bg-white/30" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-6 z-10 hidden lg:flex flex-col items-center gap-2 text-white/50">
        <span className="text-[9px] uppercase tracking-[0.2em] font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-5 w-0.5 bg-white/40 rounded-full"
        />
      </div>
    </div>
  )
}
