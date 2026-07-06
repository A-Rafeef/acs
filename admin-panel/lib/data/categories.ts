import { createClient } from '@/lib/supabase/server'
import { type Category, type Product } from '@/types'
import { isMockMode, readMockDb } from './mock-engine'

export interface CategoryWithCount extends Category {
  product_count: number;
  cover_image: string | null;
}

export async function getCategories(): Promise<Category[]> {
  if (isMockMode()) {
    const db = readMockDb()
    return db.categories.sort((a: any, b: any) => a.name.localeCompare(b.name))
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getCategoriesWithProductCount(): Promise<CategoryWithCount[]> {
  if (isMockMode()) {
    const db = readMockDb()
    const categories: CategoryWithCount[] = db.categories.map((cat: Category) => {
      const availableProducts = db.products.filter(
        (p: Product) => p.category_id === cat.id && p.status === 'available'
      )
      const coverImage = availableProducts[0]?.images?.[0]?.url || null
      return {
        ...cat,
        product_count: availableProducts.length,
        cover_image: coverImage,
      }
    })
    return categories
      .filter((c) => c.product_count > 0)
      .sort((a, b) => b.product_count - a.product_count)
  }

  const supabase = await createClient()

  // Fetch all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (catError || !categories) {
    console.error('Error fetching categories with counts:', catError)
    return []
  }

  // For each category, get count and a cover image from available products
  const result: CategoryWithCount[] = []
  for (const cat of categories) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id)
      .eq('status', 'available')

    if (count && count > 0) {
      // Get the first available product's primary image as cover
      const { data: coverProduct } = await supabase
        .from('products')
        .select('images:product_images(url, is_primary)')
        .eq('category_id', cat.id)
        .eq('status', 'available')
        .limit(1)
        .maybeSingle()

      const coverImage = coverProduct?.images?.find((img: any) => img.is_primary)?.url
        || coverProduct?.images?.[0]?.url
        || null

      result.push({
        ...cat,
        product_count: count,
        cover_image: coverImage,
      })
    }
  }

  return result.sort((a, b) => b.product_count - a.product_count)
}
