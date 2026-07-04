import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem {
  product_id: string;
  slug: string;
  title: string;
  price: number;
  image_url: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.product_id === item.product_id)
          if (exists) {
            return { items: state.items.filter((i) => i.product_id !== item.product_id) }
          }
          return { items: [...state.items, item] }
        }),
    }),
    {
      name: 'thrift-wishlist',
    }
  )
)
