import { type MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use public domain or default URL
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://minimalistthrift.com'

  // Access database directly to fetch product routes
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .in('status', ['available', 'reserved', 'sold'])

  const productUrls = (products || []).map((p) => ({
    url: `${baseUrl}/shop/${p.slug}`,
    lastModified: new Date(p.updated_at || Date.now()),
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
