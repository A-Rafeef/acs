import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { isMockMode } from '@/lib/data/mock-engine'

export const revalidate = 0

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { filename, contentType } = await request.json()
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 })
    }

    const fileKey = `products/${crypto.randomUUID()}-${filename}`

    if (isMockMode()) {
      // In mock mode, return mock credentials/uploadUrl
      return NextResponse.json({
        uploadUrl: '/api/admin/upload/mock',
        fileUrl: `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600`, // Default fashion image
        r2Key: fileKey,
        isMock: true
      })
    }

    const supabase = await createClient()
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'product-images'

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(fileKey)

    if (error) {
      console.error('Supabase signed URL error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileKey)

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      fileUrl: publicUrlData.publicUrl,
      r2Key: fileKey,
      isMock: false
    })
  } catch (err: any) {
    console.error('Upload signature error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

