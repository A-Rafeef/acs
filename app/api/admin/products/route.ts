import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { adminGetAllProducts, adminCreateProduct } from '@/lib/data/admin-products'

export const revalidate = 0

export async function GET() {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const products = await adminGetAllProducts()
    return NextResponse.json(products)
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
    const { data, error } = await adminCreateProduct(body)
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
