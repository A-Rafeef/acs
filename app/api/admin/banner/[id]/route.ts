import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { adminUpdateHeroSlide, adminDeleteHeroSlide } from '@/lib/data/hero-slides'

export const revalidate = 0

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { data, error } = await adminUpdateHeroSlide(id, body)
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  try {
    const { error } = await adminDeleteHeroSlide(id)
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
