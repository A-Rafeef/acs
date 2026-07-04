import { create } from 'zustand'

interface UIState {
  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  bagOpen: false,
  setBagOpen: (open) => set({ bagOpen: open }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}))
