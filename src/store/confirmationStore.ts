import { create } from "zustand";

interface ConfirmationScreen {
  isConfirmationScreen: boolean;
  setIsConfirmationScreen: (value: boolean) => void;
}

export const useConfirmationScreenStore = create<ConfirmationScreen>(
  (set) => ({
    isConfirmationScreen: false,
    setIsConfirmationScreen: (value) =>
      set(() => ({ isConfirmationScreen: value })),
  })
);
