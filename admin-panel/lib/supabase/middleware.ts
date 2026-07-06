import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = request.nextUrl.clone()

  // 1. Check if mock mode is triggered
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const forceMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  const isMock = forceMock || !supabaseUrl || supabaseUrl.includes('your-supabase')

  if (isMock) {
    const mockSession = request.cookies.get('mock-admin-session')?.value

    // Protect all routes except /login
    if (url.pathname !== '/login') {
      if (!mockSession) {
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    }

    // Redirect to dashboard (/) if logged in and hitting /login
    if (url.pathname === '/login' && mockSession) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // 2. Normal Supabase Session handling
  const clientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const clientKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  const supabase = createServerClient(
    clientUrl,
    clientKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all routes except /login
  if (url.pathname !== '/login') {
    if (!user) {
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect to dashboard (/) if logged in and hitting /login
  if (url.pathname === '/login' && user) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
