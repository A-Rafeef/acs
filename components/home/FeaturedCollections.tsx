'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function FeaturedCollections() {
  const collections = [
    {
      name: 'Outerwear',
      slug: 'outerwear',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
      description: 'Curated jackets, coats, and blazers.'
    },
    {
      name: 'Tops & Knitwear',
      slug: 'tops',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
      description: 'Unique shirts, sweaters, and cardigans.'
    },
    {
      name: 'Bottoms',
      slug: 'bottoms',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600',
      description: 'Tailored trousers, denim, and cargos.'
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=600',
      description: 'Minimalist leather bags, belts, and jewelry.'
    }
  ]

  return (
    <section id="collections" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Curated Closets
        </span>
        <h2 className="text-2xl font-black uppercase tracking-wide">
          Featured Collections
        </h2>
        <div className="mx-auto h-[1.5px] w-12 bg-foreground" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((col, idx) => (
          <Link
            key={col.slug}
            href={`/shop?category=${col.slug}`}
            className="group relative h-[400px] w-full overflow-hidden bg-secondary block rounded-sm shadow-sm"
          >
            {/* Collection Cover Image */}
            <Image
              src={col.image}
              alt={col.name}
              fill
              sizes="(max-w-7xl) 25vw, 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 text-white transition-opacity duration-300">
              <span className="text-[9px] uppercase tracking-widest text-zinc-300 mb-1">
                Collection {idx + 1}
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1">
                {col.name}
              </h3>
              <p className="text-[10px] text-zinc-400 font-light translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                {col.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
