'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isMockMode, readMockDb, writeMockDb } from '@/lib/data/mock-engine'

export async function createCategoryAction(name: string, slug: string) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      const newCat = {
        id: `cat-${crypto.randomUUID()}`,
        name,
        slug,
        created_at: new Date().toISOString()
      }
      db.categories.push(newCat)
      writeMockDb(db)
      revalidatePath('/shop')
      revalidatePath('/admin/categories')
      return { success: true, data: newCat }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/shop')
    revalidatePath('/admin/categories')
    return { success: true, data }
  } catch (err: any) {
    console.error('createCategoryAction failed:', err)
    return { success: false, error: err.message || 'Failed to create category' }
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      db.categories = db.categories.filter((cat: any) => cat.id !== id)
      // Clean category unlinks
      db.products = db.products.map((p: any) => p.category_id === id ? { ...p, category_id: null } : p)
      writeMockDb(db)
      revalidatePath('/shop')
      revalidatePath('/admin/categories')
      return { success: true }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/shop')
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (err: any) {
    console.error('deleteCategoryAction failed:', err)
    return { success: false, error: err.message || 'Failed to delete category' }
  }
}

export async function createBrandAction(name: string, slug: string) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      const newBrand = {
        id: `br-${crypto.randomUUID()}`,
        name,
        slug,
        created_at: new Date().toISOString()
      }
      db.brands.push(newBrand)
      writeMockDb(db)
      revalidatePath('/shop')
      revalidatePath('/admin/brands')
      return { success: true, data: newBrand }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('brands')
      .insert({ name, slug })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/shop')
    revalidatePath('/admin/brands')
    return { success: true, data }
  } catch (err: any) {
    console.error('createBrandAction failed:', err)
    return { success: false, error: err.message || 'Failed to create brand' }
  }
}

export async function deleteBrandAction(id: string) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      db.brands = db.brands.filter((br: any) => br.id !== id)
      // Clean brand unlinks
      db.products = db.products.map((p: any) => p.brand_id === id ? { ...p, brand_id: null } : p)
      writeMockDb(db)
      revalidatePath('/shop')
      revalidatePath('/admin/brands')
      return { success: true }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/shop')
    revalidatePath('/admin/brands')
    return { success: true }
  } catch (err: any) {
    console.error('deleteBrandAction failed:', err)
    return { success: false, error: err.message || 'Failed to delete brand' }
  }
}
