'use client'

import { useEffect, useRef, useState } from 'react'
import AnimateOnScroll from './AnimateOnScroll'

// Count-up hook for animated statistics
function useCountUp(target: string, duration = 1500) {
  const [display, setDisplay] = useState(target)
  const triggered = useRef(false)

  const start = () => {
    if (triggered.current) return
    triggered.current = true

    // Parse target: handle "1-of-1", "100%", "0%"
    const numericMatch = target.match(/^(\d+)/)
    if (!numericMatch) {
      setDisplay(target)
      return
    }

    const endValue = parseInt(numericMatch[1], 10)
    const suffix = target.slice(numericMatch[1].length) // e.g., "-of-1", "%"
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * endValue)

      setDisplay(`${current}${suffix}`)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  return { display, start }
}

function StatBlock({ value, label }: { value: string; label: string }) {
  const { display, start } = useCountUp(value)

  return (
    <AnimateOnScroll
      variant="fade-up"
      delay={0.1}
      className="space-y-1"
    >
      <div
        onMouseEnter={start}
        ref={(el) => {
          if (!el) return
          const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) start() },
            { threshold: 0.5 }
          )
          observer.observe(el)
        }}
      >
        <span className="block text-xl font-bold text-foreground tabular-nums">
          {display}
        </span>
        <span className="block text-[9px] uppercase tracking-wider text-foreground/45 font-bold">
          {label}
        </span>
      </div>
    </AnimateOnScroll>
  )
}

export default function BrandStory() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'MINIMALIST THRIFT'

  return (
    <section id="about" className="py-24 border-t border-border/10 bg-background transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20 items-start">
          {/* Title block */}
          <AnimateOnScroll variant="fade-right" className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/45 block">
              Our Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
              A Circular <br className="hidden sm:inline" />
              Approach <br />
              to Archival Fashion.
            </h2>
          </AnimateOnScroll>

          {/* Description block */}
          <div className="lg:col-span-7 text-sm text-foreground/60 leading-relaxed font-light space-y-6">
            <AnimateOnScroll variant="fade-up" delay={0.1}>
              <p>
                At {storeName}, we believe that garments carry histories, and exceptional design should endure across lifetimes. Traditional fast fashion leads to colossal environmental degradation; we champion an alternative built around curating and extending the lifecycle of premium, rare garments.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <p>
                Every single piece in our collection is handpicked, thoroughly inspected for quality, and authenticated. Since each garment is a 1-of-1 archival artifact, there are no restocking or duplicating runs. Once a item is sold, it is gone forever, moving forward to its next owner in the cycle of sustainable circular fashion.
              </p>
            </AnimateOnScroll>

            {/* Animated Stat block */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/10">
              <StatBlock value="1-of-1" label="Guaranteed Unique" />
              <StatBlock value="100%" label="Inspected & Sanitized" />
              <StatBlock value="0%" label="New Fabric Waste" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
