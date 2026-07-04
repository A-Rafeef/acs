'use client'

import { type Product } from '@/types'
import { useBagStore } from '@/store/useBagStore'
import { useUIStore } from '@/store/useUIStore'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'

interface AddToBagButtonProps {
  product: Product;
}

export default function AddToBagButton({ product }: AddToBagButtonProps) {
  const { addItem, items } = useBagStore()
  const { setBagOpen } = useUIStore()

  const isInBag = items.some((i) => i.product_id === product.id)

  const handleAddToBag = () => {
    const primaryImage = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url || ''
    
    addItem({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image_url: primaryImage,
      size: product.size,
      brand_name: product.brand?.name || null
    })

    toast.success('Curated item added to bag')
    // Open the drawer automatically to show addition
    setTimeout(() => {
      setBagOpen(true)
    }, 200)
  }

  return (
    <button
      onClick={handleAddToBag}
      disabled={isInBag}
      className={`w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 ${
        isInBag
          ? 'bg-secondary text-foreground/45 border-border/30 cursor-not-allowed'
          : 'bg-foreground text-background border-foreground hover:bg-foreground/80'
      }`}
    >
      <ShoppingBag className="h-4 w-4" />
      {isInBag ? 'Already in Bag' : 'Add to Bag'}
    </button>
  )
}
