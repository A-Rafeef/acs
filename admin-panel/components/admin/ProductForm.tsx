'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2, ArrowLeft, ArrowUp, ArrowDown, Star, UploadCloud } from 'lucide-react'
import { type Product, type Category, type Brand } from '@/types'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'
import Image from 'next/image'

interface FormImage {
  url: string;
  r2_key: string;
  sort_order: number;
  is_primary: boolean;
}

const productFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-_]+$/, 'Slug must contain only lowercase, numbers, and dashes'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  category_id: z.string().nullable().optional(),
  brand_id: z.string().nullable().optional(),
  condition: z.enum(['new', 'excellent', 'good', 'fair']),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  status: z.enum(['draft', 'available', 'reserved', 'sold', 'archived'])
})

type ProductFormValues = z.infer<typeof productFormSchema>

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
  const forceMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  const isMock = forceMock || !supabaseUrl || supabaseUrl.includes('your-supabase')
  const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

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
      status: initialData?.status || 'available'
    }
  })

  // Watch title to auto-generate slug
  const titleValue = watch('title')
  useEffect(() => {
    if (!initialData && titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-') // spaces to dashes
        .replace(/-+/g, '-') // collapse double dashes
      setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [titleValue, setValue, initialData])

  // Hydrate images on edit mode
  useEffect(() => {
    if (initialData?.images) {
      const initialImages = initialData.images.map((img) => ({
        url: img.url,
        r2_key: img.r2_key,
        sort_order: img.sort_order,
        is_primary: img.is_primary
      }))
      initialImages.sort((a, b) => a.sort_order - b.sort_order)
      setImages(initialImages)
    }
  }, [initialData])

  // Handle image upload and compression
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

        // 3. Retrieve public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('products')
          .getPublicUrl(filePath)

        // 4. Add image to component state
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

        toast.success(`Uploaded ${file.name} successfully`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Image processing failed')
    } finally {
      setUploading(false)
    }
  }

  // Re-order images helpers
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= images.length) return

    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[targetIdx]
    newImages[targetIdx] = temp

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
    const hadPrimary = images[index].is_primary
    const filtered = images.filter((_, idx) => idx !== index)
    const updated = filtered.map((img, idx) => ({
      ...img,
      sort_order: idx,
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
        router.push('/products')
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
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form Info fields */}
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
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
            />
            {errors.title && (
              <p className="text-[9px] text-destructive font-bold uppercase">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="slug">
              URL Slug *
            </label>
            <input
              id="slug"
              type="text"
              {...register('slug')}
              placeholder="e.g. vintage-leather-biker-jacket"
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
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
              {...register('description')}
              rows={5}
              placeholder="Provide a detailed description of the garment's quality, history, styling, fit, or details..."
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
            />
            {errors.description && (
              <p className="text-[9px] text-destructive font-bold uppercase">{errors.description.message}</p>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="price">
                Price ({currencySymbol}) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              />
              {errors.price && (
                <p className="text-[9px] text-destructive font-bold uppercase">{errors.price.message}</p>
              )}
            </div>

            {/* Size */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="size">
                Size
              </label>
              <input
                id="size"
                type="text"
                {...register('size')}
                placeholder="e.g. M, L, XL, OS"
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="category_id">
                Category
              </label>
              <select
                id="category_id"
                {...register('category_id')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="brand_id">
                Brand
              </label>
              <select
                id="brand_id"
                {...register('brand_id')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="condition">
                Condition *
              </label>
              <select
                id="condition"
                {...register('condition')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              >
                <option value="new">New / Deadstock</option>
                <option value="excellent">Excellent Vintage</option>
                <option value="good">Good Vintage</option>
                <option value="fair">Fair Wear</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
              >
                <option value="draft">Draft (Coming Soon preview)</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold Out</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Image Manager */}
        <div className="space-y-6">
          <div className="border border-border/30 p-5 rounded-md bg-secondary/5 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
              Media Upload
            </h4>
            <div className="relative">
              <input
                id="images-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="images-upload"
                className={`w-full py-6 border-2 border-dashed border-border/30 hover:border-foreground/30 transition-colors flex flex-col items-center justify-center gap-2 rounded-sm cursor-pointer ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-foreground/45" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-foreground/45" />
                )}
                <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/70">
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </span>
              </label>
            </div>

            {/* Images list queue */}
            {images.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/45">
                  Visual Queue ({images.length})
                </span>
                <div className="space-y-2.5">
                  {images.map((img, idx) => (
                    <div
                      key={img.r2_key}
                      className={`flex gap-3 items-center p-2 rounded-sm bg-background border ${
                        img.is_primary ? 'border-foreground/40' : 'border-border/10'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-12 w-9 overflow-hidden rounded bg-secondary flex-shrink-0 border border-border/10">
                        <Image src={img.url} alt="" fill sizes="36px" className="object-cover" />
                      </div>

                      {/* Controls */}
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-secondary text-foreground/50 hover:text-foreground disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'down')}
                            disabled={idx === images.length - 1}
                            className="p-1 rounded hover:bg-secondary text-foreground/50 hover:text-foreground disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              img.is_primary
                                ? 'text-amber-500 bg-amber-500/10'
                                : 'text-foreground/45 hover:text-amber-500 hover:bg-amber-500/10'
                            }`}
                            title="Set as primary cover"
                          >
                            <Star className={`h-3 w-3 ${img.is_primary ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Submission actions */}
      <div className="border-t border-border/20 pt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-border/30 hover:border-foreground/30 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="bg-foreground text-background hover:bg-foreground/80 px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-md cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Saving changes...' : initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
