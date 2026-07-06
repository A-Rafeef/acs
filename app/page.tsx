import { Suspense } from 'react'
import HeroSlider from '@/components/home/HeroSlider'
import FeaturedCollections from '@/components/home/FeaturedCollections'
import BrandStory from '@/components/home/BrandStory'
import DroppingSoon from '@/components/home/DroppingSoon'
import SizeFilteredSections from '@/components/home/SizeFilteredSections'
import RecentlyViewed from '@/components/home/RecentlyViewed'
import { CollectionsSkeleton, CarouselSkeleton, CuratorPicksSkeleton } from '@/components/home/HomeSkeleton'
import { getNewArrivals, getFeaturedProducts, getDraftProducts } from '@/lib/data/products'
import { getCategoriesWithProductCount } from '@/lib/data/categories'

export const revalidate = 3600 // Cache homepage for 1 hour

// --- Async sub-components for Suspense boundaries ---

async function FeaturedCollectionsSection() {
  const categories = await getCategoriesWithProductCount()
  return <FeaturedCollections categories={categories} />
}

async function SizeFilterableProducts() {
  const [newArrivals, featuredProducts] = await Promise.all([
    getNewArrivals(8),
    getFeaturedProducts(6),
  ])

  return (
    <SizeFilteredSections
      newArrivals={newArrivals || []}
      featuredProducts={featuredProducts || []}
    />
  )
}

async function DroppingSoonSection() {
  const draftProducts = await getDraftProducts(4)
  if (!draftProducts || draftProducts.length === 0) return null
  return <DroppingSoon products={draftProducts} />
}

// --- Main Page ---

export default function Home() {
  return (
    <div className="w-full pb-16">
      {/* 1. Dynamic Hero Slider */}
      <HeroSlider />

      {/* 2. Featured Collections Grid */}
      <Suspense fallback={<CollectionsSkeleton />}>
        <FeaturedCollectionsSection />
      </Suspense>

      {/* 3. Shop by Size + New Arrivals + Curator's Picks (with real-time size filtering) */}
      <Suspense fallback={<><CarouselSkeleton /><CuratorPicksSkeleton /></>}>
        <SizeFilterableProducts />
      </Suspense>

      {/* 4. Brand Story Statement */}
      <BrandStory />

      {/* 5. Dropping Soon (draft previews + email capture) */}
      <Suspense fallback={null}>
        <DroppingSoonSection />
      </Suspense>

      {/* 6. Recently Viewed (client-side, from localStorage) */}
      <RecentlyViewed />
    </div>
  )
}
