'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Heart, ArrowRight, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { type Product } from '@/types'
import { useBagStore } from '@/store/useBagStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useUIStore } from '@/store/useUIStore'
import { toast } from 'sonner'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem, items: bagItems } = useBagStore()
  const { items: wishlistItems, toggleItem } = useWishlistStore()
  const { setBagOpen } = useUIStore()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  // Reset image index when product changes
  useEffect(() => {
    setSelectedImageIndex(0)
  }, [product?.id])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!product) return null

  const images = product.images || []
  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const currentImage = images[selectedImageIndex] || primaryImage
  const isInBag = bagItems.some((i) => i.product_id === product.id)
  const isWishlisted = wishlistItems.some((i) => i.product_id === product.id)
  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'
  const isAvailable = product.status === 'available'

  const handleAddToBag = () => {
    addItem({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image_url: primaryImage?.url || '',
      size: product.size,
      brand_name: product.brand?.name || null,
    })
    toast.success('Added to bag')
    onClose()
    setTimeout(() => setBagOpen(true), 200)
  }

  const handleWishlist = () => {
    toggleItem({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image_url: primaryImage?.url || '',
    })
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-3xl sm:max-h-[85vh] bg-background rounded-lg border border-border/40 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-secondary text-foreground/60 hover:text-foreground transition-colors border border-border/20"
              aria-label="Close quick view"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="flex flex-col md:flex-row overflow-y-auto flex-1">
              {/* Image Section */}
              <div className="md:w-1/2 bg-secondary/30 p-4 flex flex-col gap-3">
                {/* Main Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-secondary">
                  {currentImage && (
                    <Image
                      src={currentImage.url}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  )}

                  {/* Status overlay */}
                  {isSold && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[10px] font-bold tracking-[0.25em] text-white bg-foreground/95 px-4 py-2 uppercase">Sold Out</span>
                    </div>
                  )}
                  {isReserved && (
                    <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold tracking-[0.25em] text-foreground bg-background/95 px-4 py-2 uppercase border border-border">Reserved</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail row */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-sm border-2 transition-all ${
                          idx === selectedImageIndex ? 'border-foreground' : 'border-border/20 hover:border-border/50'
                        }`}
                      >
                        <Image src={img.url} alt="" fill sizes="48px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="md:w-1/2 p-6 flex flex-col space-y-5">
                {/* Header */}
                <div className="space-y-2 border-b border-border/20 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                    {product.brand?.name || 'Curated'}
                  </span>
                  <h2 className="text-lg font-black uppercase tracking-wide">
                    {product.title}
                  </h2>
                  <p className="text-xl font-black">
                    {currencySymbol}{product.price.toLocaleString()}
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-border/20 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Size</span>
                    <span className="font-bold uppercase">{product.size || 'One Size'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Condition</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                        product.condition === 'new' ? 'bg-emerald-500' :
                        product.condition === 'excellent' ? 'bg-blue-500' :
                        product.condition === 'good' ? 'bg-amber-500' :
                        'bg-orange-500'
                      }`} />
                      <span className="font-bold uppercase">{product.condition}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Color</span>
                    <span className="font-bold uppercase">{product.color || 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Status</span>
                    <span className="font-bold uppercase">{product.status}</span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-foreground/60 leading-relaxed font-light line-clamp-3">
                    {product.description}
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-3 mt-auto pt-2">
                  <div className="flex gap-2">
                    {isAvailable && (
                      <button
                        onClick={handleAddToBag}
                        disabled={isInBag}
                        className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${
                          isInBag
                            ? 'bg-secondary text-foreground/45 border-border/30 cursor-not-allowed'
                            : 'bg-foreground text-background border-foreground hover:bg-foreground/80'
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {isInBag ? 'In Bag' : 'Add to Bag'}
                      </button>
                    )}
                    {isSold && (
                      <div className="flex-1 py-3.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 cursor-not-allowed">
                        Sold Out
                      </div>
                    )}
                    {isReserved && (
                      <div className="flex-1 py-3.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-secondary text-foreground/45 border border-border/30 cursor-not-allowed">
                        Reserved
                      </div>
                    )}
                    <button
                      onClick={handleWishlist}
                      className={`p-3.5 border transition-all rounded-sm ${
                        isWishlisted
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border/30 hover:border-foreground/40 text-foreground/60 hover:text-foreground'
                      }`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* View full page link */}
                  <Link
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors py-2"
                  >
                    View Full Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>

                  {/* Trust */}
                  <div className="flex items-center gap-2 text-[9px] text-foreground/35 font-semibold uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Authenticated 1-of-1 Piece</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
