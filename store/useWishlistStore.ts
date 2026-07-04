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
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.product_id === item.product_id)
          if (exists) {
            return { items: state.items.filter((i) => i.product_id !== item.product_id) }
          }
          return { items: [...state.items, item] }
        }),
      hasItem: (productId) => {
        return get().items.some((i) => i.product_id === productId)
      },
    }),
    {
      name: 'thrift-wishlist',
    }
  )
)
