import { createClient } from '@/lib/supabase/server'
import { isMockMode, readMockDb, writeMockDb } from './mock-engine'

export async function addToWaitlist(
  productId: string, 
  email: string, 
  phone?: string
): Promise<{ success: boolean; error?: string }> {
  if (isMockMode()) {
    const db = readMockDb()
    db.waitlist.push({
      id: `wl-${crypto.randomUUID()}`,
      product_id: productId,
      email,
      phone: phone || null,
      created_at: new Date().toISOString()
    })
    writeMockDb(db)
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('waitlist')
    .insert({
      product_id: productId,
      email,
      phone: phone || null,
    })

  if (error) {
    console.error('Error adding to waitlist:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function adminGetWaitlist(): Promise<any[]> {
  if (isMockMode()) {
    const db = readMockDb()
    return db.waitlist.map((w: any) => ({
      ...w,
      product: db.products.find((p: any) => p.id === w.product_id) || null
    }))
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('waitlist')
    .select('*, product:products(title, slug)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching waitlist:', error)
    return []
  }

  return data || []
}

export async function adminDeleteWaitlistEntry(id: string): Promise<{ success: boolean; error?: string }> {
  if (isMockMode()) {
    const db = readMockDb()
    const initial = db.waitlist.length
    db.waitlist = db.waitlist.filter((w: any) => w.id !== id)
    if (db.waitlist.length === initial) return { success: false, error: 'Not found' }
    writeMockDb(db)
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('waitlist').delete().eq('id', id)
  if (error) {
    console.error('Error deleting waitlist item:', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}

