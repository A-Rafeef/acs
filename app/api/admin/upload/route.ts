import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'
import { r2Client } from '@/lib/r2/client'

export async function POST(request: Request) {
  try {
    // 1. Authenticate check: enforce session validation
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse body inputs
    const { fileName, fileType } = await request.json()
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing fileName or fileType params' }, { status: 400 })
    }

    // 3. Generate unique R2 target object key
    const uniqueId = crypto.randomUUID()
    const fileExtension = fileName.split('.').pop() || 'webp'
    const r2Key = `products/${uniqueId}.${fileExtension}`

    // 4. Form S3 PutObject payload command
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Key,
      ContentType: fileType,
    })

    // 5. Generate signed S3 url (expires in 1hr)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${r2Key}`

    return NextResponse.json({ uploadUrl, publicUrl, r2Key })
  } catch (err: any) {
    console.error('Error generating presigned R2 upload URL:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
