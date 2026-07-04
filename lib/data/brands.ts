import { createClient } from '@/lib/supabase/server'
import { type Brand } from '@/types'
import { isMockMode, readMockDb } from './mock-engine'

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
