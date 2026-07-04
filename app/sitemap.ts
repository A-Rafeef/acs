import { type MetadataRoute } from 'next'
import { createPublicServerClient } from '@/lib/supabase/server'
import { isMockMode, readMockDb } from '@/lib/data/mock-engine'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://minimalistthrift.com'

  let productSlugs: { slug: string; updated_at: string }[] = []

  if (isMockMode()) {
    // In local mock mode, fetch product slugs from mock JSON database
    const db = readMockDb()
    productSlugs = db.products
      .filter((p: any) => ['available', 'reserved', 'sold'].includes(p.status))
      .map((p: any) => ({
        slug: p.slug,
        updated_at: p.updated_at || new Date().toISOString()
      }))
  } else {
    try {
      const supabase = createPublicServerClient()
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .in('status', ['available', 'reserved', 'sold'])
      
      productSlugs = (products || []) as { slug: string; updated_at: string }[]
    } catch (err) {
      console.error('Failed to generate dynamic sitemap slugs from Supabase:', err)
    }
  }

  const productUrls = productSlugs.map((p) => ({
    url: `${baseUrl}/shop/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5
    },
    ...productUrls
  ]
}
