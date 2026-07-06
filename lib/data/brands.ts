import { createClient, createAdminClient } from '@/lib/supabase/server'
import { type Brand } from '@/types'
import { isMockMode, readMockDb, writeMockDb } from './mock-engine'

export async function getBrands(): Promise<Brand[]> {
  if (isMockMode()) {
    const db = readMockDb()
    return db.brands.sort((a: any, b: any) => a.name.localeCompare(b.name))
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }

  return data || []
}

export async function createBrand(
  name: string
): Promise<{ data: Brand | null; error: string | null }> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  
  const now = new Date().toISOString()

  if (isMockMode()) {
    const db = readMockDb()
    const duplicate = db.brands.find((b: any) => b.slug === slug || b.name.toLowerCase() === name.toLowerCase())
    if (duplicate) {
      return { data: null, error: 'Brand already exists' }
    }

    const newBrand: Brand = {
      id: `br-${crypto.randomUUID()}`,
      name,
      slug,
      created_at: now
    }

    db.brands.push(newBrand)
    writeMockDb(db)
    return { data: newBrand, error: null }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('brands')
    .insert({ name, slug })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Brand, error: null }
}
