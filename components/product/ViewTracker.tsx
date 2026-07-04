'use client'

import { useEffect } from 'react'
import { incrementProductViewsAction } from '@/app/actions/products'

interface ViewTrackerProps {
  productId: string;
}

export default function ViewTracker({ productId }: ViewTrackerProps) {
  useEffect(() => {
    incrementProductViewsAction(productId)
  }, [productId])

  return null
}
