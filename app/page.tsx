import HeroBanner from '@/components/home/HeroBanner'
import FeaturedCollections from '@/components/home/FeaturedCollections'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import BrandStory from '@/components/home/BrandStory'
import ProductCard from '@/components/shop/ProductCard'
import { getNewArrivals, getFeaturedProducts } from '@/lib/data/products'

export const revalidate = 3600 // Cache homepage for 1 hour

export default async function Home() {
  const newArrivals = await getNewArrivals(8)
  const featuredProducts = await getFeaturedProducts(6)

  return (
    <div className="w-full pb-16">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Featured Collections Grid */}
      <FeaturedCollections />

      {/* 3. New Arrivals Horizontal Carousel */}
      {newArrivals && newArrivals.length > 0 ? (
        <NewArrivalsCarousel products={newArrivals} />
      ) : (
        <div className="py-20 bg-secondary/10 text-center text-xs text-foreground/45">
          No new arrivals listed yet. Check back soon.
        </div>
      )}

      {/* 4. Brand Story Statement */}
      <BrandStory />

      {/* 5. Curator's Picks Grid Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 border-t border-border/10">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Handpicked Items
            </span>
            <h2 className="text-2xl font-black uppercase tracking-wide">
              Curator&apos;s Picks
            </h2>
            <div className="mx-auto h-[1.5px] w-12 bg-foreground" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
