import { create } from "zustand";

interface Colapsable {
  isColapsed: boolean;
  toggle: () => void;
}

export const useColapsableInventoryStore = create<Colapsable>((set) => ({
  isColapsed: false,
  toggle: () => set((state) => ({ isColapsed: !state.isColapsed })),
}));

  
