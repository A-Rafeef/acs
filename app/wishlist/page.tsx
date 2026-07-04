'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowLeft, Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useBagStore } from '@/store/useBagStore'
import { useUIStore } from '@/store/useUIStore'
import { toast } from 'sonner'

export default function WishlistPage() {
  const { items: wishlistItems, toggleItem } = useWishlistStore()
  const { addItem, items: bagItems } = useBagStore()
  const { setBagOpen } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full flex items-center justify-center">
        <span className="text-xs uppercase tracking-widest font-bold text-foreground/45">
          Loading wishlist...
        </span>
      </div>
    )
  }

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  const handleMoveToBag = (item: typeof wishlistItems[0]) => {
    // Check if already in bag
    const isInBag = bagItems.some((i) => i.product_id === item.product_id)
    if (isInBag) {
      toast.error('Item is already in your bag')
      return
    }

    addItem({
      product_id: item.product_id,
      slug: item.slug,
      title: item.title,
      price: item.price,
      image_url: item.image_url,
      size: null, // Size is optional and fetched on details page, can be added if we store it
      brand_name: null
    })

    toast.success('Moved item to bag')
    // Open drawer
    setBagOpen(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Header Block */}
      <div className="border-b border-border/25 pb-6 space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-wide">
          Wishlist
        </h1>
        <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
          Your saved items ({wishlistItems.length})
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex h-[350px] flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-secondary p-4">
            <Heart className="h-8 w-8 text-foreground/35" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide">Wishlist is empty</p>
            <p className="text-xs text-foreground/45 max-w-xs">
              Save unique items while browsing to keep track of your favorite drops.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Start Browsing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.product_id}
              className="group relative flex flex-col space-y-3 border border-border/15 p-3 rounded-sm bg-secondary/10"
            >
              {/* Image box */}
              <Link
                href={`/shop/${item.slug}`}
                className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-sm block"
              >
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  sizes="(max-w-7xl) 25vw, 50vw"
                  className="object-cover"
                />
              </Link>

              {/* Title & Price */}
              <div className="flex-grow space-y-1">
                <Link href={`/shop/${item.slug}`} className="hover:opacity-85 block">
                  <h3 className="text-xs font-bold uppercase tracking-wider truncate">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-xs font-black">
                  {currencySymbol}{item.price.toLocaleString()}
                </p>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-border/10">
                <button
                  onClick={() => handleMoveToBag(item)}
                  className="col-span-4 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest py-2 flex items-center justify-center gap-1 hover:bg-foreground/80 transition-colors rounded-sm"
                >
                  <ShoppingBag className="h-3 w-3" /> Add to Bag
                </button>
                <button
                  onClick={() => toggleItem(item)}
                  className="col-span-1 border border-border/30 hover:border-destructive hover:text-destructive text-foreground/60 transition-colors flex items-center justify-center rounded-sm"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
