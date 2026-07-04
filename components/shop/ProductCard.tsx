'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { type Product } from '@/types'
import { useWishlistStore } from '@/store/useWishlistStore'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items: wishlistItems, toggleItem } = useWishlistStore()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'
  const isWishlisted = mounted && wishlistItems.some((i) => i.product_id === product.id)

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  // Find a secondary image for the hover swap effect
  const secondaryImage = product.images?.find((img) => !img.is_primary && img.sort_order > 0) || product.images?.[1] || primaryImage

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    toggleItem({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image_url: primaryImage?.url || '',
    })

    if (isWishlisted) {
      toast.success('Removed from wishlist')
    } else {
      toast.success('Added to wishlist')
    }
  }

  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'

  return (
    <Link
      href={`/shop/${product.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col space-y-3 cursor-pointer"
    >
      {/* Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-sm border border-border/10">
        {/* Main image */}
        {primaryImage && (
          <Image
            src={hovered && secondaryImage ? secondaryImage.url : primaryImage.url}
            alt={product.title}
            fill
            sizes="(max-w-7xl) 25vw, 50vw, 100vw"
            className="object-cover transition-all duration-500"
          />
        )}

        {/* SOLD / RESERVED Badge Overlays */}
        {isSold && (
          <div className="absolute inset-0 bg-background/45 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.25em] text-white bg-foreground/95 px-4 py-2 uppercase shadow-sm">
              Sold Out
            </span>
          </div>
        )}
        {isReserved && !isSold && (
          <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.25em] text-foreground bg-background/95 px-4 py-2 uppercase border border-border shadow-sm">
              Reserved
            </span>
          </div>
        )}

        {/* Wishlist Heart Icon Toggle Overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground/75 hover:text-foreground transition-all shadow-sm border border-border/15"
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-foreground text-foreground' : 'text-foreground/70'
            }`}
          />
        </button>
      </div>

      {/* Product Details Block */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80 truncate">
            {product.title}
          </h3>
          <span className="text-xs font-black">
            {currencySymbol}{product.price.toLocaleString()}
          </span>
        </div>
        
        {/* Secondary Meta Row */}
        <div className="flex justify-between items-center text-[10px] text-foreground/45 uppercase tracking-wide">
          <span>{product.brand?.name || 'Curated'}</span>
          <span>Size: {product.size || 'OS'}</span>
        </div>
        
        {/* Condition Info */}
        <div className="text-[9px] uppercase font-bold tracking-wider text-foreground/35 pt-0.5">
          Condition: {product.condition}
        </div>
      </div>
    </Link>
  )
}
