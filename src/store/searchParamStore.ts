import { create } from "zustand";

interface SimpleSearchParamStore {
  tempIsPrecise: boolean;
  isPrecise: boolean;
  tempParam: string;
  tempInput: string;
  input: string;
  param: string;
  secondInput: string;
  secondParam: string;
  searchCount: number;
  secondTempInput: string;
  secondTempParam: string;
  setParam: (arg: string) => void;
  setInput: (arg: string) => void;
  setTempInput: (arg: string) => void;
  setTempParam: (arg: string) => void;
  setIsPrecise: (arg: boolean) => void;
  setSecondInput: (arg: string) => void;
  setSecondParam: (arg: string) => void;
  setTempIsPrecise: (arg: boolean) => void;
  setSecondTempInput: (arg: string) => void;
  setSecondTempParam: (arg: string) => void;
  incrementSearchCount: () => void;
  resetSearchCount: () => void;
  searchId: number;
  setSearchId: (arg: number) => void;
}

export const useProductSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useClientSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useUserSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useProviderSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useSaleSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useCategorySearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const usePurchaseSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useTicketSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const usePublicationSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useElementSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useServiceSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useOperationSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useProblemSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useImageSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);

export const useMessageSearchParamStore = create<SimpleSearchParamStore>(
  (set) => ({
    searchCount: 0,
    tempIsPrecise: false,
    isPrecise: false,
    tempParam: "",
    tempInput: "",
    param: "",
    secondParam: "",
    input: "",
    secondInput: "",
    secondTempInput: "",
    secondTempParam: "",
    setParam: (arg) => set(() => ({ param: arg })),
    setInput: (arg) => set(() => ({ input: arg })),
    setTempInput: (arg) => set(() => ({ tempInput: arg })),
    setTempParam: (arg) => set(() => ({ tempParam: arg })),
    setIsPrecise: (arg) => set(() => ({ isPrecise: arg })),
    setTempIsPrecise: (arg) => set(() => ({ tempIsPrecise: arg })),
    incrementSearchCount: () =>
      set((state) => ({ searchCount: state.searchCount + 1 })),
    resetSearchCount: () => set(() => ({ searchCount: 0 })),
    setSecondParam: (arg) => set(() => ({ secondParam: arg })),
    setSecondInput: (arg) => set(() => ({ secondInput: arg })),
    setSecondTempParam: (arg) => set(() => ({ secondTempParam: arg })),
    setSecondTempInput: (arg) => set(() => ({ secondTempInput: arg })),
    searchId: 0,
    setSearchId: (arg) => set(() => ({ searchId: arg })),
  })
);