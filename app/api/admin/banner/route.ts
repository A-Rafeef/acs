import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { getHeroSlides, adminCreateHeroSlide } from '@/lib/data/hero-slides'

export const revalidate = 0

export async function GET() {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const slides = await getHeroSlides()
    return NextResponse.json(slides)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const { data, error } = await adminCreateHeroSlide(body)
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
