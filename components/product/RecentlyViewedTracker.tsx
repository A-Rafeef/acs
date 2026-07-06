'use client'

import { useEffect } from 'react'
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore'

interface RecentlyViewedTrackerProps {
  productId: string
  slug: string
  title: string
  price: number
  imageUrl: string
  brandName: string | null
}

export default function RecentlyViewedTracker({
  productId,
  slug,
  title,
  price,
  imageUrl,
  brandName,
}: RecentlyViewedTrackerProps) {
  const addItem = useRecentlyViewedStore((state) => state.addItem)

  useEffect(() => {
    addItem({
      product_id: productId,
      slug,
      title,
      price,
      image_url: imageUrl,
      brand_name: brandName,
    })
  }, [productId, slug, title, price, imageUrl, brandName, addItem])

  return null
}
