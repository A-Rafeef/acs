'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, Bell, Loader2, Check } from 'lucide-react'
import { type Product } from '@/types'
import { toast } from 'sonner'
import AnimateOnScroll from './AnimateOnScroll'
import { StaggerContainer, StaggerItem } from './AnimateOnScroll'

interface DroppingSoonProps {
  products: Product[]
}

export default function DroppingSoon({ products }: DroppingSoonProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="py-20 bg-secondary/10 transition-colors border-t border-border/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <AnimateOnScroll variant="fade-up">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45 flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Coming Soon
            </span>
            <h2 className="text-2xl font-black uppercase tracking-wide">
              Dropping Soon
            </h2>
            <p className="text-xs text-foreground/50 font-light max-w-md mx-auto">
              Sneak peek at upcoming pieces. Get notified when they drop so you don&apos;t miss out.
            </p>
            <div className="mx-auto h-[1.5px] w-12 bg-foreground" />
          </div>
        </AnimateOnScroll>

        <StaggerContainer
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          staggerDelay={0.1}
        >
          {products.slice(0, 4).map((product) => (
            <StaggerItem key={product.id}>
              <DroppingSoonCard product={product} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

function DroppingSoonCard({ product }: { product: Product }) {
  const [email, setEmail] = useState('')
  const [isNotifying, setIsNotifying] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email')
      return
    }

    setIsNotifying(true)
    try {
      // Call the waitlist server action
      const { joinWaitlistAction } = await import('@/app/actions/waitlist')
      const result = await joinWaitlistAction(product.id, email)
      if (result.success) {
        setSubscribed(true)
        toast.success('You\'ll be notified when this drops!')
      } else {
        toast.error('Something went wrong. Try again.')
      }
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsNotifying(false)
    }
  }

  return (
    <div className="group relative flex flex-col space-y-3">
      {/* Image with blur overlay */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-sm border border-border/10">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover blur-[6px] scale-105 transition-all duration-500 group-hover:blur-[3px]"
          />
        )}

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-background/30 dark:bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 space-y-3">
          <div className="bg-background/80 dark:bg-background/90 backdrop-blur-sm rounded-lg p-4 text-center space-y-3 w-full max-w-[180px] border border-border/20 shadow-lg">
            <Eye className="h-5 w-5 mx-auto text-foreground/50" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/60 block">
              Preview
            </span>

            {!showForm && !subscribed && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest px-3 py-2 rounded-sm hover:bg-foreground/85 transition-colors"
              >
                <Bell className="h-3 w-3" />
                Notify Me
              </button>
            )}

            {showForm && !subscribed && (
              <form onSubmit={handleNotifyMe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-secondary/50 border border-border/40 px-2 py-1.5 text-[10px] text-foreground placeholder:text-foreground/35 outline-none focus:border-foreground/40 rounded-sm"
                  autoFocus
                  disabled={isNotifying}
                />
                <button
                  type="submit"
                  disabled={isNotifying}
                  className="w-full inline-flex items-center justify-center gap-1 bg-foreground text-background text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm hover:bg-foreground/85 transition-colors disabled:opacity-50"
                >
                  {isNotifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
                  {isNotifying ? 'Saving...' : 'Get Notified'}
                </button>
              </form>
            )}

            {subscribed && (
              <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Subscribed</span>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-widest uppercase bg-amber-500/90 text-white px-2 py-1 rounded-sm shadow-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Soon
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60 truncate">
            {product.title}
          </h3>
          <span className="text-xs font-black text-foreground/50">
            {currencySymbol}{product.price.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-foreground/35 uppercase tracking-wide">
          <span>{product.brand?.name || 'Curated'}</span>
          <span>Size: {product.size || 'OS'}</span>
        </div>
      </div>
    </div>
  )
}
