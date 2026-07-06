import { createAdminClient } from '@/lib/supabase/server'
import { type Product, type ProductStatus, type Category, type Brand } from '@/types'
import { isMockMode, readMockDb, writeMockDb } from './mock-engine'

// ---------- READ ----------

export async function adminGetAllProducts(): Promise<Product[]> {
  if (isMockMode()) {
    const db = readMockDb()
    return db.products.map((p: Product) => ({
      ...p,
      category: db.categories.find((c: Category) => c.id === p.category_id) || null,
      brand: db.brands.find((b: Brand) => b.id === p.brand_id) || null,
    })) as Product[]
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), brand:brands(*), images:product_images(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('adminGetAllProducts error:', error)
    return []
  }
  return data as Product[]
}

export async function adminGetProductById(id: string): Promise<Product | null> {
  if (isMockMode()) {
    const db = readMockDb()
    const found = db.products.find((p: Product) => p.id === id)
    if (!found) return null
    return {
      ...found,
      category: db.categories.find((c: Category) => c.id === found.category_id) || null,
      brand: db.brands.find((b: Brand) => b.id === found.brand_id) || null,
    } as Product
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), brand:brands(*), images:product_images(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('adminGetProductById error:', error)
    return null
  }
  return data as Product
}

// ---------- CREATE ----------

export interface CreateProductPayload {
  title: string
  slug: string
  description?: string | null
  price: number
  category_id?: string | null
  brand_id?: string | null
  condition: 'new' | 'excellent' | 'good' | 'fair'
  size?: string | null
  color?: string | null
  status: ProductStatus
  images?: Array<{ url: string; r2_key: string; sort_order: number; is_primary: boolean }>
}

export async function adminCreateProduct(payload: CreateProductPayload): Promise<{ data: Product | null; error: string | null }> {
  const now = new Date().toISOString()

  if (isMockMode()) {
    const db = readMockDb()
    const id = `prod-${crypto.randomUUID()}`
    const images = (payload.images || []).map((img, i) => ({
      id: `img-${crypto.randomUUID()}`,
      product_id: id,
      url: img.url,
      r2_key: img.r2_key,
      sort_order: img.sort_order ?? i,
      is_primary: img.is_primary ?? i === 0,
      created_at: now,
    }))

    const newProduct = {
      id,
      title: payload.title,
      slug: payload.slug,
      description: payload.description ?? null,
      price: payload.price,
      category_id: payload.category_id ?? null,
      brand_id: payload.brand_id ?? null,
      condition: payload.condition,
      size: payload.size ?? null,
      color: payload.color ?? null,
      status: payload.status,
      view_count: 0,
      sold_at: null,
      archived_at: null,
      created_at: now,
      updated_at: now,
      images,
    }
    db.products.unshift(newProduct)
    writeMockDb(db)

    return {
      data: {
        ...newProduct,
        category: db.categories.find((c: Category) => c.id === payload.category_id) || null,
        brand: db.brands.find((b: Brand) => b.id === payload.brand_id) || null,
      } as Product,
      error: null,
    }
  }

  const supabase = await createAdminClient()
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      title: payload.title,
      slug: payload.slug,
      description: payload.description ?? null,
      price: payload.price,
      category_id: payload.category_id ?? null,
      brand_id: payload.brand_id ?? null,
      condition: payload.condition,
      size: payload.size ?? null,
      color: payload.color ?? null,
      status: payload.status,
    })
    .select()
    .single()

  if (productError) return { data: null, error: productError.message }

  if (payload.images && payload.images.length > 0) {
    const imageRows = payload.images.map((img, i) => ({
      product_id: product.id,
      url: img.url,
      r2_key: img.r2_key,
      sort_order: img.sort_order ?? i,
      is_primary: img.is_primary ?? i === 0,
    }))
    await supabase.from('product_images').insert(imageRows)
  }

  return { data: product as Product, error: null }
}

// ---------- UPDATE ----------

export interface UpdateProductPayload {
  title?: string
  slug?: string
  description?: string | null
  price?: number
  category_id?: string | null
  brand_id?: string | null
  condition?: 'new' | 'excellent' | 'good' | 'fair'
  size?: string | null
  color?: string | null
  status?: ProductStatus
}

export async function adminUpdateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<{ data: Product | null; error: string | null }> {
  const now = new Date().toISOString()

  if (isMockMode()) {
    const db = readMockDb()
    const idx = db.products.findIndex((p: Product) => p.id === id)
    if (idx === -1) return { data: null, error: 'Product not found' }

    const updated = {
      ...db.products[idx],
      ...payload,
      updated_at: now,
      sold_at: payload.status === 'sold' && !db.products[idx].sold_at ? now : db.products[idx].sold_at,
      archived_at: payload.status === 'archived' && !db.products[idx].archived_at ? now : db.products[idx].archived_at,
    }
    db.products[idx] = updated
    writeMockDb(db)

    return {
      data: {
        ...updated,
        category: db.categories.find((c: Category) => c.id === updated.category_id) || null,
        brand: db.brands.find((b: Brand) => b.id === updated.brand_id) || null,
      } as Product,
      error: null,
    }
  }

  const supabase = await createAdminClient()
  const updateData: any = { ...payload, updated_at: now }
  if (payload.status === 'sold') updateData.sold_at = now
  if (payload.status === 'archived') updateData.archived_at = now

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

// ---------- DELETE ----------

export async function adminDeleteProduct(id: string): Promise<{ error: string | null }> {
  if (isMockMode()) {
    const db = readMockDb()
    const initial = db.products.length
    db.products = db.products.filter((p: Product) => p.id !== id)
    if (db.products.length === initial) return { error: 'Product not found' }
    
    // Cascade delete associated waitlist entries
    db.waitlist = db.waitlist.filter((w: any) => w.product_id !== id)
    
    writeMockDb(db)
    return { error: null }
  }

  const supabase = await createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}
