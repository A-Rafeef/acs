import { createClient } from '@/lib/supabase/server'
import { type Product, type ProductStatus } from '@/types'
import { isMockMode, readMockDb } from './mock-engine'

export interface ProductFilters {
  categorySlug?: string;
  brandSlug?: string;
  condition?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  status?: ProductStatus;
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  if (isMockMode()) {
    const db = readMockDb()
    
    // Perform simulated joins
    let result = db.products.map((p: any) => ({
      ...p,
      category: db.categories.find((c: any) => c.id === p.category_id) || null,
      brand: db.brands.find((b: any) => b.id === p.brand_id) || null
    }))

    // Filter status
    if (filters?.status) {
      result = result.filter((p: any) => p.status === filters.status)
    } else {
      result = result.filter((p: any) => ['available', 'reserved', 'sold'].includes(p.status))
    }

    // Filter Category Slug
    if (filters?.categorySlug) {
      result = result.filter((p: any) => p.category?.slug === filters.categorySlug)
    }

    // Filter Brand Slug
    if (filters?.brandSlug) {
      result = result.filter((p: any) => p.brand?.slug === filters.brandSlug)
    }

    // Filter Condition
    if (filters?.condition) {
      result = result.filter((p: any) => p.condition === filters.condition)
    }

    // Filter Size
    if (filters?.size) {
      result = result.filter((p: any) => p.size === filters.size)
    }

    // Filter Prices
    if (filters?.minPrice !== undefined) {
      result = result.filter((p: any) => p.price >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter((p: any) => p.price <= filters.maxPrice!)
    }

    // Sorting
    if (filters?.sort === 'price_asc') {
      result.sort((a: any, b: any) => a.price - b.price)
    } else if (filters?.sort === 'price_desc') {
      result.sort((a: any, b: any) => b.price - a.price)
    } else {
      // Default: Newest drops
      result.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result as Product[]
  }

  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*)
    `)

  // Apply default filtering for public view (exclude draft/archived) unless admin status is requested
  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.in('status', ['available', 'reserved', 'sold'])
  }

  // Handle category filtering
  if (filters?.categorySlug) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .maybeSingle()
      
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    } else {
      return []
    }
  }

  // Handle brand filtering
  if (filters?.brandSlug) {
    const { data: brandData } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', filters.brandSlug)
      .maybeSingle()
      
    if (brandData) {
      query = query.eq('brand_id', brandData.id)
    } else {
      return []
    }
  }

  // Filter condition
  if (filters?.condition) {
    query = query.eq('condition', filters.condition)
  }

  // Filter size
  if (filters?.size) {
    query = query.eq('size', filters.size)
  }

  // Price range
  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  // Sort logic
  if (filters?.sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (filters?.sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    // Default newest
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[] || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isMockMode()) {
    const db = readMockDb()
    const found = db.products.find((p: any) => p.slug === slug)
    if (!found) return null

    return {
      ...found,
      category: db.categories.find((c: any) => c.id === found.category_id) || null,
      brand: db.brands.find((b: any) => b.id === found.brand_id) || null
    } as Product
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching product with slug ${slug}:`, error)
    return null
  }

  return data as Product
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (isMockMode()) {
    const db = readMockDb()
    const result = db.products
      .filter((p: any) => p.status === 'available')
      .map((p: any) => ({
        ...p,
        category: db.categories.find((c: any) => c.id === p.category_id) || null,
        brand: db.brands.find((b: any) => b.id === p.brand_id) || null
      }))
      .sort((a: any, b: any) => b.view_count - a.view_count)
      .slice(0, limit)

    return result as Product[]
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*)
    `)
    .eq('status', 'available')
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data as Product[]
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  if (isMockMode()) {
    const db = readMockDb()
    const result = db.products
      .filter((p: any) => p.status === 'available')
      .map((p: any) => ({
        ...p,
        category: db.categories.find((c: any) => c.id === p.category_id) || null,
        brand: db.brands.find((b: any) => b.id === p.brand_id) || null
      }))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    return result as Product[]
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching new arrivals:', error)
    return []
  }

  return data as Product[]
}

export async function getSimilarProducts(
  categoryId: string | null,
  currentProductId: string,
  size?: string | null,
  limit = 4
): Promise<Product[]> {
  if (!categoryId) return []

  if (isMockMode()) {
    const db = readMockDb()
    const available = db.products
      .filter((p: any) => p.status === 'available' && p.category_id === categoryId && p.id !== currentProductId)
      .map((p: any) => ({
        ...p,
        category: db.categories.find((c: any) => c.id === p.category_id) || null,
        brand: db.brands.find((b: any) => b.id === p.brand_id) || null
      }))

    // First pass: same category AND same size
    let firstPass = size ? available.filter((p: any) => p.size === size) : available
    firstPass = firstPass.slice(0, limit)

    if (firstPass.length >= limit) {
      return firstPass as Product[]
    }

    // Second pass: fill up with items in same category regardless of size
    const excludedIds = [currentProductId, ...firstPass.map((p: any) => p.id)]
    const remainingLimit = limit - firstPass.length
    const secondPass = available
      .filter((p: any) => !excludedIds.includes(p.id))
      .slice(0, remainingLimit)

    return [...firstPass, ...secondPass] as Product[]
  }

  const supabase = await createClient()
  
  // Try with same category AND same size
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*)
    `)
    .eq('status', 'available')
    .eq('category_id', categoryId)
    .neq('id', currentProductId)

  if (size) {
    query = query.eq('size', size)
  }

  const { data: firstPass, error: firstPassError } = await query.limit(limit)

  if (firstPassError) {
    console.error('Error fetching similar products (first pass):', firstPassError)
    return []
  }

  // If we got enough items, return them
  if (firstPass && firstPass.length >= limit) {
    return firstPass as Product[]
  }

  // Otherwise, fetch additional items in the same category (regardless of size) to fill the limit
  const excludedIds = [currentProductId, ...(firstPass || []).map((p: any) => p.id)]
  const remainingLimit = limit - (firstPass || []).length

  // Build the list of excluded UUIDs formatted as a comma separated string for PostgreSQL 'in' filter
  const formattedExclusions = excludedIds.map(id => `'${id}'`).join(',')

  const { data: secondPass, error: secondPassError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*)
    `)
    .eq('status', 'available')
    .eq('category_id', categoryId)
    .filter('id', 'not.in', `(${formattedExclusions})`)
    .limit(remainingLimit)

  if (secondPassError) {
    console.error('Error fetching similar products (second pass):', secondPassError)
    return (firstPass || []) as Product[]
  }

  return [...(firstPass || []), ...(secondPass || [])] as Product[]
}

export async function searchProducts(queryText: string): Promise<Product[]> {
  if (!queryText.trim()) return []

  if (isMockMode()) {
    const db = readMockDb()
    const term = queryText.toLowerCase()
    
    const result = db.products
      .filter((p: any) => ['available', 'reserved', 'sold'].includes(p.status))
      .map((p: any) => ({
        ...p,
        category: db.categories.find((c: any) => c.id === p.category_id) || null,
        brand: db.brands.find((b: any) => b.id === p.brand_id) || null
      }))
      .filter((p: any) => {
        return (
          p.title.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          (p.color && p.color.toLowerCase().includes(term)) ||
          (p.brand?.name && p.brand.name.toLowerCase().includes(term)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(term)) ||
          (p.size && p.size.toLowerCase().includes(term))
        )
      })
      .slice(0, 6)

    return result as Product[]
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*)
    `)
    .in('status', ['available', 'reserved', 'sold'])
    .textSearch('search_vector', queryText, { type: 'websearch' })
    .limit(10)

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return data as Product[]
}
