import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const revalidate = 0 // Do not cache API endpoints

export async function GET(request: Request) {
  try {
    // 1. Verify cron authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Instantiate bypass client
    const supabase = await createAdminClient()

    // 3. Compute 30-day cutoff
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffISO = cutoff.toISOString()

    // 4. Query sold items older than cutoff
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

    const productIds = productsToArchive.map((p) => p.id)
    
    // Extract R2 file keys
    const r2Keys: string[] = []
    productsToArchive.forEach((p: any) => {
      p.images?.forEach((img: any) => {
        if (img.r2_key) {
          r2Keys.push(img.r2_key)
        }
      })
    })

    // 5. Bulk delete from Supabase Storage (bucket name: 'products')
    if (r2Keys.length > 0) {
      const { error: deleteError } = await supabase
        .storage
        .from('products')
        .remove(r2Keys)

      if (deleteError) throw deleteError

      // Delete database reference rows since the source media is purged
      const { error: imgCleanError } = await supabase
        .from('product_images')
        .delete()
        .in('product_id', productIds)

      if (imgCleanError) throw imgCleanError
    }

    // 6. Update status machine to archived (kept for SEO indexing)
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
