import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2Client } from '@/lib/r2/client'
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

    if (isMockMode() || !process.env.R2_BUCKET_NAME || !process.env.R2_ACCOUNT_ID) {
      // In mock mode or if R2 is not fully configured, return mock credentials/uploadUrl
      return NextResponse.json({
        uploadUrl: '/api/admin/upload/mock',
        fileUrl: `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600`, // Default fashion image
        r2Key: fileKey,
        isMock: true
      })
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
    const fileUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileKey}`

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      r2Key: fileKey,
      isMock: false
    })
  } catch (err: any) {
    console.error('Upload signature error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
