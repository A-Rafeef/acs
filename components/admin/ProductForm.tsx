'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import imageCompression from 'browser-image-compression'
import { type Category, type Brand, type Product } from '@/types'
import { Trash2, Loader2, ArrowLeft, ArrowUp, ArrowDown, Star, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const productFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  category_id: z.string().min(1, 'Category is required'),
  brand_id: z.string().min(1, 'Brand is required'),
  condition: z.enum(['new', 'excellent', 'good', 'fair']),
  size: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['draft', 'available', 'reserved', 'sold', 'archived'])
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface FormImage {
  url: string;
  r2_key: string;
  sort_order: number;
  is_primary: boolean;
}

interface ProductFormProps {
  categories: Category[];
  brands: Brand[];
  initialData?: Product | null;
  onSubmitAction: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export default function ProductForm({ categories, brands, initialData, onSubmitAction }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [images, setImages] = useState<FormImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isMock = !supabaseUrl || supabaseUrl.includes('your-supabase')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      category_id: initialData?.category_id || '',
      brand_id: initialData?.brand_id || '',
      condition: initialData?.condition || 'excellent',
      size: initialData?.size || '',
      color: initialData?.color || '',
      status: initialData?.status || 'draft'
    }
  })

  const watchTitle = watch('title')

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !initialData) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setValue('slug', generatedSlug)
    }
  }, [watchTitle, setValue, initialData])

  // Populate images if initialData is provided
  useEffect(() => {
    if (initialData?.images) {
      const initialImages = initialData.images.map((img) => ({
        url: img.url,
        r2_key: img.r2_key,
        sort_order: img.sort_order,
        is_primary: img.is_primary
      }))
      // Sort initially by sort_order
      initialImages.sort((a, b) => a.sort_order - b.sort_order)
      setImages(initialImages)
    }
  }, [initialData])

  // Handle client-side WebP compression and direct Cloudflare R2 presigned upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      if (isMock) {
        // Mock local preview file reading
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const objectUrl = URL.createObjectURL(file)
          
          setImages((prev) => {
            const nextOrder = prev.length
            const isFirst = prev.length === 0
            return [
              ...prev,
              {
                url: objectUrl,
                r2_key: `mock-r2/${crypto.randomUUID()}-${file.name}`,
                sort_order: nextOrder,
                is_primary: isFirst
              }
            ]
          })
          toast.success(`Mock uploaded ${file.name} (Object URL preview)`)
        }
        return
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 1. WebP compression configuration
        const compressionOptions = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: 'image/webp'
        }

        const compressedBlob = await imageCompression(file, compressionOptions)
        const compressedFile = new File(
          [compressedBlob], 
          `${file.name.split('.')[0] || 'img'}.webp`, 
          { type: 'image/webp' }
        )

        // 2. Upload to Supabase Storage (bucket name: 'products')
        const fileExt = 'webp'
        const uniqueId = crypto.randomUUID()
        const filePath = `${uniqueId}.${fileExt}`

        const { error: uploadError } = await supabase
          .storage
          .from('products')
          .upload(filePath, compressedFile, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // 3. Retrieve public asset URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('products')
          .getPublicUrl(filePath)

        // 4. Add image to component state list
        setImages((prev) => {
          const nextOrder = prev.length
          const isFirst = prev.length === 0
          return [
            ...prev,
            {
              url: publicUrl,
              r2_key: filePath,
              sort_order: nextOrder,
              is_primary: isFirst
            }
          ]
        })

        toast.success(`Uploaded ${file.name} to Supabase Storage`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Image processing failed')
    } finally {
      setUploading(false)
    }
  }

  // Re-order images helpers (Move items up / down in the visual queue)
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= images.length) return

    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[targetIdx]
    newImages[targetIdx] = temp

    // Re-assign sort orders
    const finalized = newImages.map((img, idx) => ({
      ...img,
      sort_order: idx
    }))

    setImages(finalized)
  }

  const setPrimaryImage = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }))
    setImages(updated)
  }

  const removeImage = (index: number) => {
    const removedImage = images[index]
    const filtered = images.filter((_, idx) => idx !== index)
    // Reassign sort order and handle primary
    const hadPrimary = filtered.some((img) => img.is_primary)
    const updated = filtered.map((img, idx) => ({
      ...img,
      sort_order: idx,
      // If the removed image was primary and we have items left, make first one primary
      is_primary: !hadPrimary && idx === 0 ? true : img.is_primary
    }))
    setImages(updated)
  }

  const onSubmit = async (values: ProductFormValues) => {
    if (images.length === 0) {
      toast.error('Add at least one product image')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...values,
        images
      }

      const res = await onSubmitAction(payload)
      if (res.success) {
        toast.success(initialData ? 'Product updated successfully' : 'Product created successfully')
        router.push('/admin/products')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save product')
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Back navigation */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Columns: Text Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="title">
              Product Title *
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              placeholder="e.g. Vintage leather biker jacket"
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm"
            />
            {errors.title && (
              <p className="text-[9px] text-destructive font-bold uppercase">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="slug">
              Slug (URL slug) *
            </label>
            <input
              id="slug"
              type="text"
              {...register('slug')}
              placeholder="vintage-leather-biker-jacket"
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm"
            />
            {errors.slug && (
              <p className="text-[9px] text-destructive font-bold uppercase">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="description">
              Product Description
            </label>
            <textarea
              id="description"
              rows={5}
              {...register('description')}
              placeholder="Describe condition details, fits, material counts..."
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="price">
                Price *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="25000"
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm"
              />
              {errors.price && (
                <p className="text-[9px] text-destructive font-bold uppercase">{errors.price.message}</p>
              )}
            </div>

            {/* Condition */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="condition">
                Condition *
              </label>
              <select
                id="condition"
                {...register('condition')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground bg-background rounded-sm"
              >
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="category_id">
                Category *
              </label>
              <select
                id="category_id"
                {...register('category_id')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground bg-background rounded-sm"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-[9px] text-destructive font-bold uppercase">{errors.category_id.message}</p>
              )}
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="brand_id">
                Brand *
              </label>
              <select
                id="brand_id"
                {...register('brand_id')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground bg-background rounded-sm"
              >
                <option value="">Select Brand</option>
                {brands.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
              {errors.brand_id && (
                <p className="text-[9px] text-destructive font-bold uppercase">{errors.brand_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Size */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="size">
                Size
              </label>
              <input
                id="size"
                type="text"
                {...register('size')}
                placeholder="e.g. M, L, XL"
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground bg-background rounded-sm"
              />
            </div>

            {/* Color */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="color">
                Color
              </label>
              <input
                id="color"
                type="text"
                {...register('color')}
                placeholder="e.g. Black, Charcoal"
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground bg-background rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Images, Status & Submit */}
        <div className="space-y-6">
          {/* Status Machine selection */}
          <div className="border border-border/30 p-5 rounded-sm bg-secondary/5 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider">Publication</h4>
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="status">
                Product Status
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground bg-background rounded-sm"
              >
                <option value="draft">Draft</option>
                <option value="available">Available (Active)</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold Out</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Image Upload Zone */}
          <div className="border border-border/30 p-5 rounded-sm bg-secondary/5 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider">Media Upload</h4>

            {/* Drag Zone */}
            <div className="relative border-2 border-dashed border-border/35 hover:border-foreground/30 rounded-sm p-6 text-center cursor-pointer transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 text-foreground/60">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-foreground/45" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-foreground/40" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider">Upload Images</span>
                <span className="text-[9px] text-foreground/40">Select photos (auto compressed to WebP)</span>
              </div>
            </div>

            {/* Uploaded Images List with Ordering Controls */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={img.r2_key}
                    className={`flex items-center justify-between p-2 rounded-sm border ${
                      img.is_primary ? 'border-foreground/40 bg-foreground/5' : 'border-border/25 bg-background'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative h-10 w-8 overflow-hidden bg-secondary border border-border/10 rounded-sm flex-shrink-0">
                        <Image
                          src={img.url}
                          alt="preview"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wide truncate text-foreground/80 max-w-[100px]">
                        Order #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Set Primary */}
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className={`p-1 rounded-sm transition-colors ${
                          img.is_primary ? 'text-amber-500' : 'text-foreground/30 hover:text-amber-500'
                        }`}
                        title="Set as primary thumbnail"
                      >
                        <Star className="h-3 w-3 fill-current" />
                      </button>

                      {/* Move controls */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, 'up')}
                        className="p-1 text-foreground/40 hover:text-foreground hover:bg-secondary rounded-sm disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 'down')}
                        className="p-1 text-foreground/40 hover:text-foreground hover:bg-secondary rounded-sm disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 text-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-sm"
                        title="Delete image reference"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action Buttons */}
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full bg-foreground text-background text-xs font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 hover:bg-foreground/80 transition-all rounded-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Product
              </>
            ) : (
              initialData ? 'Update Product' : 'Publish Product'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
