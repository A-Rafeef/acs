'use client'

import Link from 'next/link'
import Image from 'next/image'
import { type CategoryWithCount } from '@/lib/data/categories'
import { StaggerContainer, StaggerItem } from './AnimateOnScroll'
import AnimateOnScroll from './AnimateOnScroll'

interface FeaturedCollectionsProps {
  categories: CategoryWithCount[]
}

// Fallback Unsplash images per category slug for when no product images exist
const fallbackImages: Record<string, string> = {
  outerwear: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
  tops: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
  bottoms: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600',
  accessories: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=600',
}

const defaultFallback = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600'

export default function FeaturedCollections({ categories }: FeaturedCollectionsProps) {
  if (!categories || categories.length === 0) return null

  return (
    <section id="collections" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <AnimateOnScroll variant="fade-up">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Curated Closets
          </span>
          <h2 className="text-2xl font-black uppercase tracking-wide">
            Featured Collections
          </h2>
          <div className="mx-auto h-[1.5px] w-12 bg-foreground" />
        </div>
      </AnimateOnScroll>

      <StaggerContainer
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        staggerDelay={0.12}
      >
        {categories.slice(0, 4).map((cat, idx) => {
          const coverImage = cat.cover_image || fallbackImages[cat.slug] || defaultFallback

          return (
            <StaggerItem key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative h-[400px] w-full overflow-hidden bg-secondary block rounded-sm shadow-sm"
              >
                {/* Collection Cover Image */}
                <Image
                  src={coverImage}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 text-white transition-opacity duration-300">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-300 mb-1">
                    {cat.product_count} {cat.product_count === 1 ? 'piece' : 'pieces'}
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-light translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {cat.description || `Explore our ${cat.name.toLowerCase()} collection.`}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerContainer>
    </section>
  )
}
