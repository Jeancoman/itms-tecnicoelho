import { create } from "zustand";

interface Searched {
    wasSearch: boolean,
    setWasSearch: (arg: boolean) => void,
}

export const useSearchedStore = create<Searched>((set) => ({
    wasSearch: false,
    setWasSearch: (arg) => set(() => ({ wasSearch: arg })),
  }));