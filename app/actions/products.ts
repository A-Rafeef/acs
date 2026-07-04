'use server'

import { createClient } from '@/lib/supabase/server'
import { isMockMode, readMockDb, writeMockDb } from '@/lib/data/mock-engine'

import { searchProducts } from '@/lib/data/products'

export async function incrementProductViewsAction(productId: string) {
  try {
    if (isMockMode()) {
      const db = readMockDb()
      const product = db.products.find((p: any) => p.id === productId)
      if (product) {
        product.view_count = (product.view_count || 0) + 1
        writeMockDb(db)
      }
      return { success: true }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc('increment_view_count', { product_id: productId })
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Failed to increment view count:', err)
    return { success: false, error: err.message }
  }
}

export async function searchProductsAction(queryText: string) {
  try {
    const data = await searchProducts(queryText)
    return { success: true, data }
  } catch (err: any) {
    console.error('Search action failed:', err)
    return { success: false, error: err.message || 'Search execution failed' }
  }
}

