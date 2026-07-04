'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { type ProductImage } from '@/types'
import { X, ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
  images: ProductImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return <div className="aspect-[3/4] w-full bg-secondary rounded-sm" />
  }

  const activeImage = images[activeIdx] || images[0]

  return (
    <div className="space-y-4">
      {/* Large Primary Display */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-sm group border border-border/10">
        <Image
          src={activeImage.url}
          alt="Product details"
          fill
          priority
          sizes="(max-w-7xl) 50vw, 100vw"
          className="object-cover"
        />
        
        {/* Zoom Lightbox Action Button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-background/80 hover:bg-background text-foreground/80 hover:text-foreground transition-all shadow-sm border border-border/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Zoom image"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnail Rows (Only display if multiple images) */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative aspect-[3/4] overflow-hidden bg-secondary rounded-sm border transition-all ${
                idx === activeIdx
                  ? 'border-foreground ring-1 ring-foreground'
                  : 'border-border/30 hover:border-foreground/40'
              }`}
            >
              <Image
                src={img.url}
                alt="Product thumbnail"
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all"
              aria-label="Close fullscreen view"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-3xl h-[80vh]">
              <Image
                src={activeImage.url}
                alt="Product detail fullscreen"
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
