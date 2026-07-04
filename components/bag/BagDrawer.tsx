'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useBagStore } from '@/store/useBagStore'
import { useUIStore } from '@/store/useUIStore'
import { AnimatePresence, motion } from 'framer-motion'

export default function BagDrawer() {
  const { items, removeItem, clearBag } = useBagStore()
  const { bagOpen, setBagOpen } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (bagOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [bagOpen])

  if (!mounted) return null

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890'

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  const handleCheckout = () => {
    if (items.length === 0) return

    const itemList = items
      .map(
        (item) =>
          `• *${item.title}*${item.brand_name ? ` (${item.brand_name})` : ''} - ${item.size ? `Size ${item.size}` : 'OS'}: ${currencySymbol}${item.price.toLocaleString()}`
      )
      .join('\n')

    const message = `Hello! I would like to order the following 1-of-1 items:\n\n${itemList}\n\n*Total Amount:* ${currencySymbol}${totalPrice.toLocaleString()}\n\nPlease verify availability and let me know the payment details!`

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^+\d]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  };

  return (
    <AnimatePresence>
      {bagOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setBagOpen(false)}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl border-l border-border/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-base font-bold uppercase tracking-wider">Your Bag</h2>
                <span className="text-xs text-foreground/45">({items.length})</span>
              </div>
              <button
                onClick={() => setBagOpen(false)}
                className="rounded-full p-1 text-foreground/60 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                  <div className="rounded-full bg-secondary p-4">
                    <ShoppingBag className="h-8 w-8 text-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Your bag is empty</p>
                    <p className="text-xs text-foreground/40">Add unique curated pieces to start your order.</p>
                  </div>
                  <button
                    onClick={() => setBagOpen(false)}
                    className="mt-2 text-xs font-semibold uppercase tracking-widest border border-foreground/20 px-6 py-2.5 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      layout
                      key={item.product_id}
                      className="flex items-center space-x-4 border-b border-border/20 pb-4"
                    >
                      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-secondary">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow space-y-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wide truncate">
                            {item.title}
                          </h4>
                          <span className="text-xs font-bold whitespace-nowrap">
                            {currencySymbol}{item.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-foreground/45 truncate">
                          {item.brand_name || 'Generic'}
                        </p>
                        <p className="text-[10px] uppercase font-medium text-foreground/60">
                          Size: {item.size || 'One Size'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-1 text-foreground/40 hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="border-t border-border/40 bg-secondary/30 p-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-wide">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-foreground/45">
                  Checking out will redirect you to WhatsApp with your pre-filled cart. Standard cellular charges apply. Available items are first-come, first-served.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={clearBag}
                    className="border border-foreground/15 text-xs font-semibold uppercase tracking-widest py-3 text-foreground/75 hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="bg-foreground text-background text-xs font-semibold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-foreground/80 transition-colors"
                  >
                    Checkout <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
