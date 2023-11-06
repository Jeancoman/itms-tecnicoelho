import { create } from "zustand";

interface Function {
    resetAllSearchs: () => void,
    setFunction: (arg: () => void) => void;
}

export const useFunctionStore = create<Function>((set) => ({
    resetAllSearchs: () => {},
    setFunction: (arg: () => void) => set(() => ({ resetAllSearchs: arg })),
  }));