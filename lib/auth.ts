import { createClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/data/mock-engine'
import { cookies } from 'next/headers'

export async function isAdminAuthenticated() {
  if (isMockMode()) {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    return token === 'mock-admin-token'
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}
