'use client'

import { useEffect, useRef } from 'react'
import { incrementProductViewsAction } from '@/app/actions/products'

interface ViewTrackerProps {
  productId: string;
}

export default function ViewTracker({ productId }: ViewTrackerProps) {
  const tracked = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Only track once per product per session to prevent inflated view counts
    // from back-navigation, refreshes, or re-renders
    if (tracked.current.has(productId)) return
    tracked.current.add(productId)

    incrementProductViewsAction(productId)
  }, [productId])

  return null
}
