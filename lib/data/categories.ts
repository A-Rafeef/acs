import { createClient } from '@/lib/supabase/server'
import { type Category } from '@/types'
import { isMockMode, readMockDb } from './mock-engine'

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
