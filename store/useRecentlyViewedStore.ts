import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedItem {
  product_id: string
  slug: string
  title: string
  price: number
  image_url: string
  brand_name: string | null
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
  addItem: (item: RecentlyViewedItem) => void
}

const MAX_ITEMS = 8

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // Remove if already exists (to move it to the front)
          const filtered = state.items.filter(
            (i) => i.product_id !== item.product_id
          )
          // Prepend and cap at MAX_ITEMS
          return { items: [item, ...filtered].slice(0, MAX_ITEMS) }
        }),
    }),
    {
      name: 'thrift-recently-viewed',
    }
  )
)
