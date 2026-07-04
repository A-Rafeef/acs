import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type BagItem } from '@/types'

interface BagState {
  items: BagItem[];
  addItem: (item: BagItem) => void;
  removeItem: (productId: string) => void;
  clearBag: () => void;
}

export const useBagStore = create<BagState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // Since items are 1-of-1, we check if the item is already in the bag
          const exists = state.items.some((i) => i.product_id === item.product_id)
          if (exists) return state
          return { items: [...state.items, item] }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== productId),
        })),
      clearBag: () => set({ items: [] }),
    }),
    {
      name: 'thrift-bag',
    }
  )
)
