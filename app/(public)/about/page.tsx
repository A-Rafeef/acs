'use client'

import AnimateOnScroll from '@/components/home/AnimateOnScroll'
import { ShieldCheck, Heart, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'MINIMALIST THRIFT'

  return (
    <div className="w-full pb-24">
      {/* 1. Hero Title Section */}
      <section className="relative py-20 sm:py-32 border-b border-border/10 bg-secondary/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <AnimateOnScroll variant="fade-in">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/45 block mb-2">
              Our Story
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="scale-in" delay={0.1}>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wide leading-tight">
              Garments Carry Histories. <br /> We Curate the Next Chapter.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={0.2} className="max-w-xl mx-auto">
            <p className="text-sm sm:text-base text-foreground/60 font-light leading-relaxed">
              At {storeName}, we stand against fast-fashion hyper-production. We curating high-grade 1-of-1 archival clothing pieces to foster a circular, sustainable lifecycle for luxury garments.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 2. Core Pillars */}
      <section className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <AnimateOnScroll variant="fade-up" delay={0.1} className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-foreground/80" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Guaranteed Authentic
            </h3>
            <p className="text-xs text-foreground/60 font-light leading-relaxed">
              Every drop is fully authenticated. We specialize in luxury and vintage items, thoroughly analyzing construction, fabrics, tags, and hardware to ensure absolute authenticity.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.2} className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <Heart className="h-5 w-5 text-foreground/80" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Inspected & Sanitized
            </h3>
            <p className="text-xs text-foreground/60 font-light leading-relaxed">
              Our inventory undergoes rigorous dry cleaning, sanitization, and conditioning before listing. You receive premium-grade garments ready to wear from day one.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.3} className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-foreground/80" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Zero Fabric Waste
            </h3>
            <p className="text-xs text-foreground/60 font-light leading-relaxed">
              Buying second-hand keeps quality textiles out of landfills. We focus on archival clothing built to last decades, preventing the extraction of raw materials.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 3. Detailed Philosophy */}
      <section className="py-20 border-t border-b border-border/10 bg-secondary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20 items-center">
            <AnimateOnScroll variant="fade-right" className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/45 block">
                The Movement
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                Slow Fashion, <br />
                Archived Permanently.
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-left" className="lg:col-span-7 text-xs sm:text-sm text-foreground/60 leading-relaxed font-light space-y-6">
              <p>
                Fast fashion relies on constant consumption, producing millions of tons of carbon emissions and textile waste annually. Our response is simple: value quality over quantity, preserve what is already created, and discover the beauty of vintage design.
              </p>
              <p>
                Each item in our catalog is unique: a 1-of-1 piece with its own narrative. Once it sells, it disappears from our active catalog to find a place in its next owner&apos;s wardrobe. By curating these drops, we invite you to participate in a sustainable loop that does not compromise on luxury or aesthetic identity.
              </p>
              <div className="pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-foreground text-background px-6 py-3 hover:bg-foreground/80 transition-all rounded-sm"
                >
                  Explore Catalog <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  )
}
