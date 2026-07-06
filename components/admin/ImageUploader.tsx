'use client'

import { useState, useRef } from 'react'
import { Upload, X, Star, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface UploadedImage {
  url: string
  r2_key: string
  sort_order: number
  is_primary: boolean
  file?: File
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File): Promise<UploadedImage> => {
    // 1. Ask API for signature/upload info
    const signatureRes = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    })

    if (!signatureRes.ok) {
      throw new Error('Failed to get upload signature')
    }

    const { uploadUrl, fileUrl, r2Key, isMock } = await signatureRes.json()

    if (isMock) {
      // Mock mode fallback: convert file to Base64 data URL so they can see their actual uploaded image
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            r2_key: r2Key,
            sort_order: images.length,
            is_primary: images.length === 0
          })
        }
        reader.onerror = (error) => reject(error)
      })
    }

    // Production R2 upload using presigned PUT URL
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    })

    if (!uploadRes.ok) {
      throw new Error('Upload to storage failed')
    }

    return {
      url: fileUrl,
      r2_key: r2Key,
      sort_order: images.length,
      is_primary: images.length === 0
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    const toastId = toast.loading(`Uploading ${files.length} image(s)...`)

    try {
      const uploadPromises = files.map((file) => processFile(file))
      const newImages = await Promise.all(uploadPromises)

      // Merge and update sort orders
      const updated = [...images, ...newImages].map((img, idx) => ({
        ...img,
        sort_order: idx,
        is_primary: idx === 0 ? true : img.is_primary
      }))

      onChange(updated)
      toast.success('Images uploaded successfully', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Image upload failed', { id: toastId })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    const updated = images
      .filter((_, idx) => idx !== indexToRemove)
      .map((img, idx) => ({
        ...img,
        sort_order: idx,
        is_primary: idx === 0 ? true : img.is_primary
      }))
    onChange(updated)
  }

  const setPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }))
    onChange(updated)
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return

    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    // Re-assign sort orders
    const final = updated.map((img, idx) => ({
      ...img,
      sort_order: idx,
      is_primary: idx === 0 ? true : img.is_primary
    }))

    onChange(final)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
          Product Images
        </label>
        <span className="text-[10px] text-foreground/45 uppercase font-medium">
          {images.length} uploaded (First is cover)
        </span>
      </div>

      {/* Grid of uploaded images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.r2_key + idx}
              className="group relative aspect-[3/4] border border-border/15 bg-secondary/10 rounded-sm overflow-hidden flex flex-col justify-end"
            >
              <Image
                src={img.url}
                alt="Product thumbnail"
                fill
                sizes="(max-w-7xl) 20vw, 30vw"
                className="object-cover"
              />

              {/* Cover badge */}
              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-foreground text-background text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-background stroke-background" /> Cover
                </div>
              )}

              {/* Action Toolbar */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  {/* Sorting actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'up')}
                      className="p-1 rounded-sm bg-secondary text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'down')}
                      className="p-1 rounded-sm bg-secondary text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1 rounded-sm bg-destructive/15 text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Cover Selector */}
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="w-full bg-foreground text-background text-[9px] font-black uppercase tracking-widest py-1.5 rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Set as Cover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drag/Click Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed border-border/40 hover:border-foreground/40 bg-secondary/5 hover:bg-secondary/15 py-8 px-6 rounded-sm text-center cursor-pointer transition-all ${
          uploading ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-6 w-6 text-foreground/40" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              {uploading ? 'Uploading...' : 'Select product photos'}
            </p>
            <p className="text-[9px] text-foreground/45 uppercase tracking-widest font-semibold">
              Supports JPG, PNG, WEBP. Drag and drop reordering.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
