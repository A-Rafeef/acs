import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isMockMode, readMockDb, writeMockDb } from './mock-engine'

export interface HeroSlide {
  id: string
  image: string
  subtitle: string
  titleLine1: string
  titleLine2: string
  description: string
  ctaText: string
  ctaHref: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
  sortOrder: number
}

// Map db properties to UI properties
function mapSlide(dbSlide: any): HeroSlide {
  return {
    id: dbSlide.id,
    image: dbSlide.image,
    subtitle: dbSlide.subtitle || '',
    titleLine1: dbSlide.title_line_1,
    titleLine2: dbSlide.title_line_2 || '',
    description: dbSlide.description || '',
    ctaText: dbSlide.cta_text || 'Shop',
    ctaHref: dbSlide.cta_href || '/shop',
    secondaryCtaText: dbSlide.secondary_cta_text || '',
    secondaryCtaHref: dbSlide.secondary_cta_href || '',
    sortOrder: dbSlide.sort_order ?? 0
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (isMockMode()) {
    const db = readMockDb()
    const slides = db.hero_slides || []
    return slides
      .map((s: any) => ({
        id: s.id,
        image: s.image,
        subtitle: s.subtitle,
        titleLine1: s.title_line_1,
        titleLine2: s.title_line_2,
        description: s.description,
        ctaText: s.cta_text,
        ctaHref: s.cta_href,
        secondaryCtaText: s.secondary_cta_text,
        secondaryCtaHref: s.secondary_cta_href,
        sortOrder: s.sort_order ?? 0
      }))
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
  }

  const supabase = createPublicServerClient() // wait, no cookie checking needed for public slides!
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching hero slides:', error)
    return []
  }

  return (data || []).map(mapSlide)
}

// Admin helper functions

export async function adminCreateHeroSlide(payload: Omit<HeroSlide, 'id'>): Promise<{ data: HeroSlide | null; error: string | null }> {
  const now = new Date().toISOString()
  const dbSlide = {
    image: payload.image,
    subtitle: payload.subtitle,
    title_line_1: payload.titleLine1,
    title_line_2: payload.titleLine2,
    description: payload.description,
    cta_text: payload.ctaText,
    cta_href: payload.ctaHref,
    secondary_cta_text: payload.secondaryCtaText || null,
    secondary_cta_href: payload.secondaryCtaHref || null,
    sort_order: payload.sortOrder
  }

  if (isMockMode()) {
    const db = readMockDb()
    if (!db.hero_slides) db.hero_slides = []
    
    const newSlide = {
      id: `slide-${crypto.randomUUID()}`,
      ...dbSlide
    }
    
    db.hero_slides.push(newSlide)
    writeMockDb(db)
    
    return { data: mapSlide(newSlide), error: null }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('hero_slides')
    .insert(dbSlide)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: mapSlide(data), error: null }
}

export async function adminUpdateHeroSlide(
  id: string,
  payload: Partial<HeroSlide>
): Promise<{ data: HeroSlide | null; error: string | null }> {
  const dbUpdate: any = {}
  if (payload.image !== undefined) dbUpdate.image = payload.image
  if (payload.subtitle !== undefined) dbUpdate.subtitle = payload.subtitle
  if (payload.titleLine1 !== undefined) dbUpdate.title_line_1 = payload.titleLine1
  if (payload.titleLine2 !== undefined) dbUpdate.title_line_2 = payload.titleLine2
  if (payload.description !== undefined) dbUpdate.description = payload.description
  if (payload.ctaText !== undefined) dbUpdate.cta_text = payload.ctaText
  if (payload.ctaHref !== undefined) dbUpdate.cta_href = payload.ctaHref
  if (payload.secondaryCtaText !== undefined) dbUpdate.secondary_cta_text = payload.secondaryCtaText || null
  if (payload.secondaryCtaHref !== undefined) dbUpdate.secondary_cta_href = payload.secondaryCtaHref || null
  if (payload.sortOrder !== undefined) dbUpdate.sort_order = payload.sortOrder

  if (isMockMode()) {
    const db = readMockDb()
    const idx = db.hero_slides?.findIndex((s: any) => s.id === id) ?? -1
    if (idx === -1) return { data: null, error: 'Slide not found' }

    const updated = {
      ...db.hero_slides[idx],
      ...dbUpdate
    }
    db.hero_slides[idx] = updated
    writeMockDb(db)

    return { data: mapSlide(updated), error: null }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('hero_slides')
    .update(dbUpdate)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: mapSlide(data), error: null }
}

export async function adminDeleteHeroSlide(id: string): Promise<{ error: string | null }> {
  if (isMockMode()) {
    const db = readMockDb()
    const initial = db.hero_slides?.length || 0
    db.hero_slides = (db.hero_slides || []).filter((s: any) => s.id !== id)
    if (db.hero_slides.length === initial) return { error: 'Slide not found' }
    writeMockDb(db)
    return { error: null }
  }

  const supabase = await createAdminClient()
  const { error } = await supabase.from('hero_slides').delete().eq('id', id)
  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Client helper for static page dynamic rendering prevention
function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return {
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        })
      })
    } as any
  }

  const { createServerClient } = require('@supabase/ssr')
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
