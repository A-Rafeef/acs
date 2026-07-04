'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function HeroBanner() {
  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-zinc-950 flex items-center justify-start px-4 sm:px-6 lg:px-12">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_bg.png"
          alt="Curated Vintage Fashion Editorial"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65 dark:opacity-45"
        />
        {/* Vibe overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Hero Text Content */}
      <div className="relative z-10 max-w-2xl text-left text-white space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-300">
            Premium Curated Archive
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] font-sans">
            Curated Vintage. <br />
            <span className="text-zinc-400">Sustainable Luxury.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-sm sm:text-base leading-relaxed text-zinc-300 max-w-lg font-light"
        >
          Curating rare, high-quality, and unique 1-of-1 designer archives and vintage garments for the modern circular wardrobe.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="pt-2"
        >
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest px-8 py-4 transition-all duration-300 rounded-sm shadow-md"
          >
            Shop the Collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
        <span className="text-[9px] uppercase tracking-[0.2em] font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-4 w-0.5 bg-white/40"
        />
      </div>
    </div>
  )
}
