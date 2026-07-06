import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { adminDeleteWaitlistEntry } from '@/lib/data/waitlist'

export const revalidate = 0

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  try {
    const { success, error } = await adminDeleteWaitlistEntry(id)
    
    if (!success) {
      return NextResponse.json({ error: error || 'Failed to delete waitlist entry' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
