import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, ShieldCheck } from 'lucide-react'
import { getProductBySlug, getSimilarProducts } from '@/lib/data/products'
import ImageGallery from '@/components/product/ImageGallery'
import AddToBagButton from '@/components/product/AddToBagButton'
import WaitlistForm from '@/components/product/WaitlistForm'
import ViewTracker from '@/components/product/ViewTracker'
import RecentlyViewedTracker from '@/components/product/RecentlyViewedTracker'
import ProductCard from '@/components/shop/ProductCard'
import { type Metadata } from 'next'

export const revalidate = 60 // ISR: 1 minute

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getProductBySlug(resolvedParams.slug)
  if (!product) return {}

  const title = `${product.title.toUpperCase()} | Curated Thrift`
  const description = product.description || `Buy the unique 1-of-1 ${product.title}. Premium curated second-hand fashion.`
  const primaryImage = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params
  const product = await getProductBySlug(resolvedParams.slug)

  // Verify product validity and status visibility
  if (!product || product.status === 'archived' || product.status === 'draft') {
    notFound()
  }

  const similarProducts = await getSimilarProducts(
    product.category_id,
    product.id,
    product.size,
    4
  )

  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'
  
  // JSON-LD structured data for search crawlers
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    image: product.images?.map((img) => img.url) || [],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: process.env.NEXT_PUBLIC_CURRENCY_CODE || 'NGN',
      availability:
        product.status === 'sold'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Generic',
    },
    size: product.size || 'OS',
    color: product.color || '',
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-12">
      {/* View tracking trigger */}
      <ViewTracker productId={product.id} />
      <RecentlyViewedTracker
        productId={product.id}
        slug={product.slug}
        title={product.title}
        price={product.price}
        imageUrl={product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url || ''}
        brandName={product.brand?.name || null}
      />

      {/* JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back button */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>

      {/* Product Details Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-7">
          <ImageGallery images={product.images || []} />
        </div>

        {/* Right Column: Information & Actions */}
        <div className="md:col-span-5 space-y-8">
          <div className="space-y-4 border-b border-border/20 pb-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                {product.brand?.name || 'Curated'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
                {product.title}
              </h1>
            </div>
            
            <p className="text-xl font-black">
              {currencySymbol}{product.price.toLocaleString()}
            </p>
          </div>

          {/* Metadata Specs Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-border/20 pb-6">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Size</span>
              <span className="font-bold uppercase">{product.size || 'One Size'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Condition</span>
              <span className="font-bold uppercase">{product.condition}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Color</span>
              <span className="font-bold uppercase">{product.color || 'Curated'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-foreground/45 block">Status</span>
              <span className="font-bold uppercase">{product.status}</span>
            </div>
          </div>

          {/* Action Trigger Block (Status Machine) */}
          <div className="space-y-4">
            {product.status === 'available' && (
              <AddToBagButton product={product} />
            )}
            {product.status === 'reserved' && (
              <button
                disabled
                className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-secondary text-foreground/45 border border-border/30 cursor-not-allowed flex items-center justify-center gap-2"
              >
                Item Reserved
              </button>
            )}
            {product.status === 'sold' && (
              <div className="space-y-6">
                <button
                  disabled
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Sold Out
                </button>
                {/* Waitlist register */}
                <WaitlistForm productId={product.id} />
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2 border-t border-border/20 pt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Description
              </h3>
              <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line font-light">
                {product.description}
              </p>
            </div>
          )}

          {/* Trust assurances */}
          <div className="flex items-center gap-2.5 text-[10px] text-foreground/45 border-t border-border/20 pt-6 font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-foreground/60" />
            <span>Guaranteed Authentic & Curated 1-of-1</span>
          </div>
        </div>
      </div>

      {/* Similar Items Carousel */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="border-t border-border/20 pt-16 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/45">
              Explore More Pieces
            </span>
            <h2 className="text-lg font-bold uppercase tracking-wider">
              Similar Items
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
