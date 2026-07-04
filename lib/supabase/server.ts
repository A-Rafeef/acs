import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            neq: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            })
          }),
          in: () => ({
            textSearch: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            })
          })
        })
      }),
      storage: {
        from: () => ({
          remove: async () => ({ data: null, error: null })
        })
      }
    } as any
  }

  const cookieStore = await cookies()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin-specific client bypassing RLS when needed (using service role key)
export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            in: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    } as any
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
// Client for public operations that do not read cookies (prevents static build dynamic rendering errors)
export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return {
      from: () => ({
        select: () => ({
          in: () => Promise.resolve({ data: [], error: null })
        })
      })
    } as any
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
