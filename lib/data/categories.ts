import { createClient, createAdminClient } from '@/lib/supabase/server'
import { type Category, type Product } from '@/types'
import { isMockMode, readMockDb, writeMockDb } from './mock-engine'

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

export async function createCategory(
  name: string,
  description?: string | null
): Promise<{ data: Category | null; error: string | null }> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  
  const now = new Date().toISOString()

  if (isMockMode()) {
    const db = readMockDb()
    const duplicate = db.categories.find((c: any) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase())
    if (duplicate) {
      return { data: null, error: 'Category already exists' }
    }

    const newCategory: Category = {
      id: `cat-${crypto.randomUUID()}`,
      name,
      slug,
      description: description || null,
      created_at: now
    }

    db.categories.push(newCategory)
    writeMockDb(db)
    return { data: newCategory, error: null }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, description: description || null })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Category, error: null }
}
