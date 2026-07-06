'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Edit, ArrowUp, ArrowDown, Upload, X, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { type HeroSlide } from '@/lib/data/hero-slides'

interface BannerManagerProps {
  initialSlides: HeroSlide[]
}

export default function BannerManager({ initialSlides }: BannerManagerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides)
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleOpenCreate = () => {
    setEditingSlide({
      subtitle: '',
      titleLine1: '',
      titleLine2: '',
      description: '',
      image: '/hero_bg.png',
      ctaText: 'Shop the Collection',
      ctaHref: '/shop',
      secondaryCtaText: '',
      secondaryCtaHref: '',
      sortOrder: slides.length
    })
    setShowModal(true)
  }

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const toastId = toast.loading('Uploading slide background...')

    try {
      const signatureRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      })

      if (!signatureRes.ok) {
        throw new Error('Failed to get signature')
      }

      const { uploadUrl, fileUrl, isMock } = await signatureRes.json()

      if (isMock) {
        // Dev Base64 conversion
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          setEditingSlide((prev: any) => ({ ...prev, image: reader.result as string }))
          toast.success('Local image processed successfully', { id: toastId })
          setUploading(false)
        }
        return
      }

      // R2 PUT
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })

      if (!uploadRes.ok) throw new Error('R2 storage upload failed')

      setEditingSlide((prev: any) => ({ ...prev, image: fileUrl }))
      toast.success('Image uploaded successfully', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSlide?.titleLine1?.trim()) {
      toast.error('Title Line 1 is required')
      return
    }

    const url = editingSlide.id ? `/api/admin/banner/${editingSlide.id}` : '/api/admin/banner'
    const method = editingSlide.id ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSlide)
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save slide')
      }

      const savedSlide = await res.json()

      if (editingSlide.id) {
        setSlides((prev) => prev.map((s) => (s.id === savedSlide.id ? savedSlide : s)))
        toast.success('Slide updated')
      } else {
        setSlides((prev) => [...prev, savedSlide])
        toast.success('New slide added')
      }

      setShowModal(false)
      setEditingSlide(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return

    try {
      const res = await fetch(`/api/admin/banner/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Deletion failed')

      toast.success('Slide deleted')
      setSlides((prev) => prev.filter((s) => s.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete slide')
    }
  }

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= slides.length) return

    const updated = [...slides]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    // Set updated sorts
    const final = updated.map((slide, idx) => ({
      ...slide,
      sortOrder: idx
    }))

    setSlides(final)

    // Save order changes to DB asynchronously
    try {
      await Promise.all(
        final.map((s) =>
          fetch(`/api/admin/banner/${s.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: s.sortOrder })
          })
        )
      )
      toast.success('Order updated')
      router.refresh()
    } catch {
      toast.error('Failed to sync slide order')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/25 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide">
            Hero Slides
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Configure homepage background banner slides ({slides.length} active slides)
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest px-4 py-3 hover:bg-foreground/80 transition-colors rounded-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        </div>
      </div>

      {/* Slide grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="group relative border border-border/15 p-4 rounded-sm bg-secondary/5 flex flex-col justify-between space-y-4"
          >
            {/* Slide Visual Mock card */}
            <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden rounded-sm border border-border/10">
              <Image
                src={slide.image}
                alt={slide.titleLine1}
                fill
                sizes="(max-w-7xl) 50vw, 100vw"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4 text-white">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">
                  {slide.subtitle || 'Banner'}
                </span>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wide">
                    {slide.titleLine1}
                  </h3>
                  {slide.titleLine2 && (
                    <h3 className="text-[10px] font-bold uppercase text-zinc-400">
                      {slide.titleLine2}
                    </h3>
                  )}
                  <p className="text-[8px] text-zinc-400 font-light max-w-[200px] leading-normal truncate">
                    {slide.description}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <span className="bg-white text-zinc-950 text-[7px] font-bold uppercase px-2 py-0.5 rounded-sm">
                    {slide.ctaText}
                  </span>
                  {slide.secondaryCtaText && (
                    <span className="bg-transparent border border-white/20 text-white text-[7px] font-bold uppercase px-2 py-0.5 rounded-sm">
                      {slide.secondaryCtaText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Slide Details info and Actions */}
            <div className="flex items-center justify-between border-t border-border/10 pt-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">
                Slide Order: {slide.sortOrder + 1}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={idx === 0}
                  onClick={() => moveSlide(idx, 'up')}
                  className="p-2 border border-border/30 rounded-sm hover:bg-secondary/40 text-foreground/60 disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={idx === slides.length - 1}
                  onClick={() => moveSlide(idx, 'down')}
                  className="p-2 border border-border/30 rounded-sm hover:bg-secondary/40 text-foreground/60 disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(slide)}
                  className="p-2 border border-border/30 rounded-sm hover:bg-secondary/40 text-foreground/60 cursor-pointer"
                  title="Edit Slide"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 border border-border/30 rounded-sm hover:bg-destructive/10 hover:text-destructive text-foreground/40 cursor-pointer"
                  title="Delete Slide"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showModal && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-background border border-border/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md shadow-2xl p-6 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border/25 pb-4">
              <h2 className="text-sm font-black uppercase tracking-wider">
                {editingSlide.id ? 'Edit Slide' : 'New Hero Slide'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-foreground/60 hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form Col */}
              <div className="space-y-4">
                {/* Title Line 1 */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                    Title Line 1 (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.titleLine1 || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, titleLine1: e.target.value })}
                    placeholder="e.g. Curated Vintage."
                    className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm"
                  />
                </div>

                {/* Title Line 2 */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                    Title Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingSlide.titleLine2 || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, titleLine2: e.target.value })}
                    placeholder="e.g. Sustainable Luxury."
                    className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                    Subtitle Tag
                  </label>
                  <input
                    type="text"
                    value={editingSlide.subtitle || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    placeholder="e.g. New Drops"
                    className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                    Description Text
                  </label>
                  <textarea
                    rows={4}
                    value={editingSlide.description || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                    placeholder="Provide context or hook copy details..."
                    className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm leading-relaxed resize-none font-light"
                  />
                </div>
              </div>

              {/* Right Form Col */}
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60 block">
                    Background Photo
                  </label>
                  <div className="relative aspect-[16/9] w-full bg-zinc-950 rounded-sm overflow-hidden border border-border/25 flex items-center justify-center">
                    {editingSlide.image ? (
                      <>
                        <Image
                          src={editingSlide.image}
                          alt="Banner background preview"
                          fill
                          className="object-cover opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingSlide({ ...editingSlide, image: '' })}
                          className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white/70 hover:text-white cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <Upload className="h-6 w-6 mx-auto text-foreground/40" />
                        <p className="text-[10px] uppercase font-bold text-foreground/60">No image uploaded</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="slide-bg-upload"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => document.getElementById('slide-bg-upload')?.click()}
                    className="w-full border border-border/30 hover:border-foreground/40 text-xs font-bold uppercase tracking-widest py-2 flex items-center justify-center gap-1.5 transition-colors rounded-sm cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploading ? 'Processing...' : 'Upload Image'}</span>
                  </button>
                </div>

                {/* Primary CTA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                      Primary CTA Text
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSlide.ctaText || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                      className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                      Primary CTA Link
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSlide.ctaHref || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, ctaHref: e.target.value })}
                      className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-mono text-foreground/75"
                    />
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                      Secondary CTA Text
                    </label>
                    <input
                      type="text"
                      value={editingSlide.secondaryCtaText || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCtaText: e.target.value })}
                      placeholder="e.g. Our Story"
                      className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                      Secondary CTA Link
                    </label>
                    <input
                      type="text"
                      value={editingSlide.secondaryCtaHref || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCtaHref: e.target.value })}
                      placeholder="e.g. /about"
                      className="w-full bg-secondary/20 border border-border/25 px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-mono text-foreground/75"
                    />
                  </div>
                </div>
              </div>

              {/* Submit panel */}
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 border-t border-border/25 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-border/30 hover:border-foreground/30 text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-foreground text-background text-xs font-bold uppercase tracking-widest py-3 px-8 hover:bg-foreground/80 transition-colors rounded-sm cursor-pointer disabled:opacity-50"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
