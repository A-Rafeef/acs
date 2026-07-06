import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isMockMode } from '@/lib/data/mock-engine'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export async function POST() {
  try {
    if (isMockMode()) {
      const cookieStore = await cookies()
      cookieStore.delete('admin_token')
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
