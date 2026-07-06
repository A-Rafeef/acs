'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isMockMode, readMockDb, writeMockDb } from '@/lib/data/mock-engine'

export interface ProductFormData {
  title: string;
  slug: string;
  description?: string;
  price: number;
  category_id?: string;
  brand_id?: string;
  condition: 'new' | 'excellent' | 'good' | 'fair';
  size?: string;
  color?: string;
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
  images: { url: string; r2_key: string; sort_order: number; is_primary: boolean }[];
}

export async function createProductAction(data: ProductFormData) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      const newId = `prod-${crypto.randomUUID()}`
      
      const newProduct = {
        id: newId,
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        condition: data.condition,
        size: data.size || null,
        color: data.color || null,
        status: data.status,
        view_count: 0,
        sold_at: data.status === 'sold' ? new Date().toISOString() : null,
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: data.images.map((img) => ({
          id: `img-${crypto.randomUUID()}`,
          product_id: newId,
          url: img.url,
          r2_key: img.r2_key,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
          created_at: new Date().toISOString()
        }))
      }

      db.products.push(newProduct)
      writeMockDb(db)
      
      revalidatePath('/')
      return { success: true, id: newId }
    }

    const supabase = await createClient()

    // 1. Insert product row
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        condition: data.condition,
        size: data.size || null,
        color: data.color || null,
        status: data.status,
        sold_at: data.status === 'sold' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (productError) {
      console.error('DB Product Insert Error:', productError)
      return { success: false, error: productError.message }
    }

    // 2. Insert associated images
    if (data.images && data.images.length > 0) {
      const imagesToInsert = data.images.map((img) => ({
        product_id: product.id,
        url: img.url,
        r2_key: img.r2_key,
        sort_order: img.sort_order,
        is_primary: img.is_primary,
      }))

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imagesToInsert)

      if (imagesError) {
        console.error('DB Product Images Insert Error:', imagesError)
        return { success: false, error: `Product created but image links failed: ${imagesError.message}` }
      }
    }

    revalidatePath('/')
    return { success: true, id: product.id }
  } catch (err: any) {
    console.error('createProductAction failed:', err)
    return { success: false, error: err.message || 'Server action execution failed' }
  }
}

export async function updateProductAction(id: string, data: ProductFormData) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      const idx = db.products.findIndex((p: any) => p.id === id)
      
      if (idx !== -1) {
        const existing = db.products[idx]
        db.products[idx] = {
          ...existing,
          title: data.title,
          slug: data.slug,
          description: data.description || null,
          price: data.price,
          category_id: data.category_id || null,
          brand_id: data.brand_id || null,
          condition: data.condition,
          size: data.size || null,
          color: data.color || null,
          status: data.status,
          sold_at: data.status === 'sold' ? (existing.sold_at || new Date().toISOString()) : null,
          updated_at: new Date().toISOString(),
          images: data.images.map((img) => ({
            id: `img-${crypto.randomUUID()}`,
            product_id: id,
            url: img.url,
            r2_key: img.r2_key,
            sort_order: img.sort_order,
            is_primary: img.is_primary,
            created_at: new Date().toISOString()
          }))
        }
        writeMockDb(db)
      }
      
      revalidatePath('/')
      return { success: true }
    }

    const supabase = await createClient()

    // 1. Update product row
    const { error: productError } = await supabase
      .from('products')
      .update({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        condition: data.condition,
        size: data.size || null,
        color: data.color || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Only set sold_at if status is being changed to 'sold' and it wasn't already sold
    if (data.status === 'sold') {
      await supabase
        .from('products')
        .update({ sold_at: new Date().toISOString() })
        .eq('id', id)
        .is('sold_at', null)
    } else {
      await supabase
        .from('products')
        .update({ sold_at: null })
        .eq('id', id)
    }

    if (productError) {
      console.error('DB Product Update Error:', productError)
      return { success: false, error: productError.message }
    }

    // 2. Re-sync images: delete current ones first
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)

    if (deleteError) {
      console.error('DB Product Images Delete Error:', deleteError)
      return { success: false, error: `Failed to remove old images: ${deleteError.message}` }
    }

    // 3. Insert updated list
    if (data.images && data.images.length > 0) {
      const imagesToInsert = data.images.map((img) => ({
        product_id: id,
        url: img.url,
        r2_key: img.r2_key,
        sort_order: img.sort_order,
        is_primary: img.is_primary,
      }))

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imagesToInsert)

      if (imagesError) {
        console.error('DB Product Images Re-insert Error:', imagesError)
        return { success: false, error: `Product updated but image sync failed: ${imagesError.message}` }
      }
    }

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('updateProductAction failed:', err)
    return { success: false, error: err.message || 'Server action execution failed' }
  }
}

export async function deleteProductAction(id: string) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      db.products = db.products.filter((p: any) => p.id !== id)
      writeMockDb(db)
      
      revalidatePath('/')
      return { success: true }
    }

    const supabase = await createClient()

    // Database cascades delete the entries in product_images automatically
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('DB Product Delete Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('deleteProductAction failed:', err)
    return { success: false, error: err.message || 'Server action execution failed' }
  }
}
