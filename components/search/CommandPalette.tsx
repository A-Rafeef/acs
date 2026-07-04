'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { createClient } from '@/lib/supabase/client'
import { type Product } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'

export default function CommandPalette() {
  const router = useRouter()
  const { searchOpen, setSearchOpen } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Toggle command palette on Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, setSearchOpen])

  // Focus input when palette opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*),
            images:product_images(*)
          `)
          .in('status', ['available', 'reserved', 'sold'])
          .textSearch('search_vector', query.trim().split(/\s+/).join(' & '), { type: 'websearch' })
          .limit(6)

        if (error) throw error
        setResults(data as Product[] || [])
      } catch (err) {
        console.error('FTS Search Error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, supabase])

  const handleSelectProduct = (slug: string) => {
    setSearchOpen(false)
    router.push(`/shop/${slug}`)
  }

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg overflow-hidden bg-background rounded-lg border border-border/40 shadow-2xl"
          >
            {/* Search Input Area */}
            <div className="relative flex items-center border-b border-border/40 px-4 py-4">
              <Search className="h-5 w-5 text-foreground/40 mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type brand, color, size, or style..."
                className="w-full bg-transparent text-sm text-foreground placeholder-foreground/45 outline-none"
              />
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-foreground/40" />
              ) : (
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-full text-foreground/40 hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results Area */}
            <div className="max-h-[300px] overflow-y-auto p-4">
              {!query ? (
                <div className="text-center py-8 text-xs text-foreground/45 space-y-1">
                  <p>Looking for something special?</p>
                  <p className="text-[10px] text-foreground/35">Press <kbd className="font-sans border border-foreground/20 px-1 py-0.5 rounded text-[9px] bg-secondary">Ctrl</kbd> + <kbd className="font-sans border border-foreground/20 px-1 py-0.5 rounded text-[9px] bg-secondary">K</kbd> to open anytime.</p>
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="text-center py-8 text-xs text-foreground/45">
                  No items found matching &quot;{query}&quot;
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/45 px-2 pb-1">
                    Products
                  </p>
                  {results.map((product) => {
                    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product.slug)}
                        className="flex w-full items-center justify-between p-2 rounded hover:bg-secondary/70 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {primaryImage && (
                            <div className="relative h-12 w-10 overflow-hidden bg-secondary rounded flex-shrink-0">
                              <Image
                                src={primaryImage.url}
                                alt={product.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wide truncate">
                              {product.title}
                            </h4>
                            <p className="text-[10px] text-foreground/45 truncate">
                              {product.brand?.name || 'Generic'} • Size {product.size || 'OS'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-right">
                          <span className="text-xs font-bold">
                            {currencySymbol}{product.price.toLocaleString()}
                          </span>
                          {product.status === 'sold' && (
                            <span className="text-[9px] font-bold tracking-wider text-destructive bg-destructive/10 px-1.5 py-0.5 uppercase">
                              Sold
                            </span>
                          )}
                          <ArrowRight className="h-3 w-3 text-foreground/30" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
