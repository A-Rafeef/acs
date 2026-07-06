import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isMockMode } from '@/lib/data/mock-engine'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (isMockMode()) {
      if (password === 'admin') {
        const cookieStore = await cookies()
        cookieStore.set('admin_token', 'mock-admin-token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/'
        })
        return NextResponse.json({ success: true, mode: 'mock' })
      } else {
        return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
      }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, mode: 'supabase' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
