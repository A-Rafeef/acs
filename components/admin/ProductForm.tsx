'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { type Product, type Category, type Brand } from '@/types'
import { toast } from 'sonner'
import ImageUploader from './ImageUploader'

// Zod validation schema
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-_]+$/, 'Slug must be lower-case alphanumeric (kebab-case)'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  category_id: z.string().min(1, 'Please select a category'),
  brand_id: z.string().min(1, 'Please select a brand'),
  condition: z.enum(['new', 'excellent', 'good', 'fair']),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  status: z.enum(['draft', 'available', 'reserved', 'sold', 'archived'])
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Product | null
  categories: Category[]
  brands: Brand[]
}

export default function ProductForm({
  initialData,
  categories,
  brands
}: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState<any[]>(
    initialData?.images?.map((img) => ({
      url: img.url,
      r2_key: img.r2_key,
      sort_order: img.sort_order,
      is_primary: img.is_primary
    })) || []
  )

  const [categoriesList, setCategoriesList] = useState<Category[]>(categories)
  const [brandsList, setBrandsList] = useState<Brand[]>(brands)
  
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [savingCat, setSavingCat] = useState(false)

  const [newBrandName, setNewBrandName] = useState('')
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [savingBrand, setSavingBrand] = useState(false)

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      toast.error('Category name is required')
      return
    }
    setSavingCat(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create category')
      }
      const newCategory = await res.json()
      setCategoriesList((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
      setValue('category_id', newCategory.id, { shouldValidate: true })
      toast.success(`Category "${newCategory.name}" added`)
      setNewCatName('')
      setNewCatDesc('')
      setShowAddCat(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingCat(false)
    }
  }

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Brand name is required')
      return
    }
    setSavingBrand(true)
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName.trim() })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create brand')
      }
      const newBrand = await res.json()
      setBrandsList((prev) => [...prev, newBrand].sort((a, b) => a.name.localeCompare(b.name)))
      setValue('brand_id', newBrand.id, { shouldValidate: true })
      toast.success(`Brand "${newBrand.name}" added`)
      setNewBrandName('')
      setShowAddBrand(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingBrand(false)
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
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

  const watchedTitle = watch('title')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Auto-slug generation from title
  useEffect(() => {
    if (initialData || slugManuallyEdited) return
    const slugified = watchedTitle
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-') // collapse dashes
    setValue('slug', slugified, { shouldValidate: true })
  }, [watchedTitle, initialData, setValue, slugManuallyEdited])

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0 && data.status !== 'draft') {
      toast.error('Please upload at least one image before launching')
      return
    }

    setSubmitting(true)
    const url = initialData ? `/api/admin/products/${initialData.id}` : '/api/admin/products'
    const method = initialData ? 'PATCH' : 'POST'

    const payload = {
      ...data,
      images: images.map((img, i) => ({
        ...img,
        sort_order: i,
        is_primary: i === 0
      }))
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save product')
      }

      toast.success(initialData ? 'Product updated successfully' : 'Product created successfully')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Column - Product Meta Details */}
      <div className="lg:col-span-7 space-y-6">
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
              Product Title
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. 1-of-1 Arc'teryx Alpha SV Shell"
              className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-semibold"
            />
            {errors.title && (
              <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
              URL Slug
            </label>
            <input
              type="text"
              {...register('slug')}
              onChange={(e) => {
                setSlugManuallyEdited(true)
                setValue('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'), { shouldValidate: true })
              }}
              placeholder="arcteryx-alpha-sv-shell"
              className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-mono text-foreground/65"
            />
            {errors.slug && (
              <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                {errors.slug.message}
              </span>
            )}
          </div>

          {/* Brand & Category Select fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCat(!showAddCat)}
                  className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                >
                  {showAddCat ? 'Cancel' : '+ Add New'}
                </button>
              </div>
              <select
                {...register('category_id')}
                className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-semibold cursor-pointer"
              >
                <option value="" disabled className="bg-background">Select Category</option>
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id} className="bg-background">{c.name}</option>
                ))}
              </select>
              {errors.category_id && (
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                  {errors.category_id.message}
                </span>
              )}
              {showAddCat && (
                <div className="p-3 border border-border/25 rounded-sm bg-secondary/5 space-y-2 mt-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name"
                    className="w-full bg-secondary/20 border border-border/25 px-2 py-1.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm"
                  />
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Description (Optional)"
                    className="w-full bg-secondary/20 border border-border/25 px-2 py-1.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm"
                  />
                  <button
                    type="button"
                    disabled={savingCat}
                    onClick={handleAddCategory}
                    className="w-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {savingCat ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              )}
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                  Brand
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddBrand(!showAddBrand)}
                  className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                >
                  {showAddBrand ? 'Cancel' : '+ Add New'}
                </button>
              </div>
              <select
                {...register('brand_id')}
                className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-semibold cursor-pointer"
              >
                <option value="" disabled className="bg-background">Select Brand</option>
                {brandsList.map((b) => (
                  <option key={b.id} value={b.id} className="bg-background">{b.name}</option>
                ))}
              </select>
              {errors.brand_id && (
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                  {errors.brand_id.message}
                </span>
              )}
              {showAddBrand && (
                <div className="p-3 border border-border/25 rounded-sm bg-secondary/5 space-y-2 mt-2">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Brand Name"
                    className="w-full bg-secondary/20 border border-border/25 px-2 py-1.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm"
                  />
                  <button
                    type="button"
                    disabled={savingBrand}
                    onClick={handleAddBrand}
                    className="w-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {savingBrand ? 'Saving...' : 'Save Brand'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Specifications */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Price (₦ NGN)
              </label>
              <input
                type="number"
                {...register('price')}
                placeholder="45000"
                className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-black"
              />
              {errors.price && (
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                  {errors.price.message}
                </span>
              )}
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Condition
              </label>
              <select
                {...register('condition')}
                className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-semibold cursor-pointer"
              >
                <option value="new" className="bg-background">New / Deadstock</option>
                <option value="excellent" className="bg-background">Excellent / Like New</option>
                <option value="good" className="bg-background">Good / Light Wear</option>
                <option value="fair" className="bg-background">Fair / Distressed</option>
              </select>
              {errors.condition && (
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                  {errors.condition.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Size */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Size
              </label>
              <input
                type="text"
                {...register('size')}
                placeholder="e.g. M, L, OS, W32/L30"
                className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-semibold uppercase"
              />
              {errors.size && (
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                  {errors.size.message}
                </span>
              )}
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Color
              </label>
              <input
                type="text"
                {...register('color')}
                placeholder="e.g. Charcoal Black"
                className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-semibold"
              />
              {errors.color && (
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                  {errors.color.message}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
              Garment Description
            </label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Provide sizing details, measurements (pit-to-pit, length), fabrics, defects/patina, and styling recommendations."
              className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-light leading-relaxed resize-none"
            />
            {errors.description && (
              <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Status, Images & Launch Button */}
      <div className="lg:col-span-5 space-y-6">
        {/* Status Dropdown */}
        <div className="space-y-1.5 bg-secondary/5 border border-border/10 p-5 rounded-sm">
          <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">
            Publication Status
          </label>
          <select
            {...register('status')}
            className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 text-xs text-foreground outline-none focus:border-foreground/40 transition-all rounded-sm font-bold uppercase tracking-wide cursor-pointer"
          >
            <option value="draft" className="bg-background">Draft (Hidden)</option>
            <option value="available" className="bg-background">Available (On Catalog)</option>
            <option value="reserved" className="bg-background">Reserved (In Cart)</option>
            <option value="sold" className="bg-background">Sold Out</option>
            <option value="archived" className="bg-background">Archived (Purged)</option>
          </select>
          <p className="text-[9px] text-foreground/45 uppercase tracking-wider leading-normal mt-2">
            ⚠️ Only <span className="font-bold">Available</span>, <span className="font-bold">Reserved</span>, and <span className="font-bold">Sold</span> products are visible to public visitors.
          </p>
        </div>

        {/* Media Uploader */}
        <div className="border border-border/15 p-5 rounded-sm bg-secondary/5">
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {/* Submit Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="border border-border/30 hover:border-foreground/30 text-xs font-bold uppercase tracking-widest py-3 text-center transition-all rounded-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-foreground text-background text-xs font-bold uppercase tracking-widest py-3 hover:bg-foreground/80 transition-colors rounded-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Saving...' : initialData ? 'Update Drop' : 'Create Drop'}
          </button>
        </div>
      </div>
    </form>
  )
}
