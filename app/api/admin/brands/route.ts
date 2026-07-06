import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createBrand } from '@/lib/data/brands'

export const revalidate = 0

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { name } = await request.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data, error } = await createBrand(name.trim())
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
