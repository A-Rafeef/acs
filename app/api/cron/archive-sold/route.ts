import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2Client } from '@/lib/r2/client'
import { isMockMode, readMockDb, writeMockDb } from '@/lib/data/mock-engine'

export const revalidate = 0 // Do not cache API endpoints

export async function GET(request: Request) {
  try {
    // 1. Verify cron authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 3. Compute 30-day cutoff
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffTime = cutoff.getTime()

    // 2. Handle Mock Mode Local Database
    if (isMockMode()) {
      const db = readMockDb()
      
      const toArchive = db.products.filter((p: any) => 
        p.status === 'sold' && p.sold_at && new Date(p.sold_at).getTime() < cutoffTime
      )

      if (toArchive.length === 0) {
        return NextResponse.json({
          message: 'No sold items require archiving today.',
          archived_count: 0
        })
      }

      const productIds = toArchive.map((p: any) => p.id)
      
      // Update database mock objects to archived status and clear images
      db.products = db.products.map((p: any) => {
        if (productIds.includes(p.id)) {
          return {
            ...p,
            status: 'archived',
            archived_at: new Date().toISOString(),
            images: []
          }
        }
        return p
      })

      writeMockDb(db)

      return NextResponse.json({
        message: 'Mock maintenance archived completed successfully.',
        archived_count: productIds.length,
        images_deleted: 0
      })
    }

    // 3. Live Supabase/R2 Production execution
    const supabase = await createAdminClient()

    // Query sold items older than cutoff
    const cutoffISO = cutoff.toISOString()
    const { data: productsToArchive, error: fetchError } = await supabase
      .from('products')
      .select('id, images:product_images(r2_key)')
      .eq('status', 'sold')
      .lt('sold_at', cutoffISO)

    if (fetchError) throw fetchError

    if (!productsToArchive || productsToArchive.length === 0) {
      return NextResponse.json({
        message: 'No sold items require archiving today.',
        archived_count: 0
      })
    }

    const productIds = productsToArchive.map((p: any) => p.id)
    
    // Extract R2 file keys
    const r2Keys: string[] = []
    productsToArchive.forEach((p: any) => {
      p.images?.forEach((img: any) => {
        if (img.r2_key) {
          r2Keys.push(img.r2_key)
        }
      })
    })

    // Delete media from Cloudflare R2 via S3-compatible API
    if (r2Keys.length > 0) {
      const deletePromises = r2Keys.map((key) =>
        r2Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
          })
        ).catch((err) => {
          console.error(`Failed to delete R2 object ${key}:`, err)
        })
      )
      await Promise.allSettled(deletePromises)

      // Delete database reference rows since the source media is purged
      const { error: imgCleanError } = await supabase
        .from('product_images')
        .delete()
        .in('product_id', productIds)

      if (imgCleanError) throw imgCleanError
    }

    // Update status machine to archived (kept for SEO indexing)
    const { error: archiveError } = await supabase
      .from('products')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .in('id', productIds)

    if (archiveError) throw archiveError

    return NextResponse.json({
      message: 'Maintenance archived completed successfully.',
      archived_count: productIds.length,
      images_deleted: r2Keys.length
    })
  } catch (err: any) {
    console.error('Maintenance Cron Error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
