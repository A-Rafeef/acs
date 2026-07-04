import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = request.nextUrl.clone()

  // 1. Check if mock mode is triggered
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isMock = !supabaseUrl || supabaseUrl.includes('your-supabase')

  if (isMock) {
    const mockSession = request.cookies.get('mock-admin-session')?.value

    // Protect admin routes: redirect to login if no mock cookie exists
    if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
      if (!mockSession) {
        url.pathname = '/admin/login'
        url.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    }

    // Redirect to dashboard if mock session exists and hitting login page
    if (url.pathname === '/admin/login' && mockSession) {
      url.pathname = '/admin/dashboard'
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

  // Admin route protection: check if path is /admin and redirect to /admin/login if not logged in
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    if (!user) {
      url.pathname = '/admin/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect to dashboard if logged in admin tries to hit /admin/login
  if (url.pathname === '/admin/login' && user) {
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
