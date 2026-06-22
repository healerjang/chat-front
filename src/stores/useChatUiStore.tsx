import { create } from "zustand";

interface ChatUiStore {
    streamEnabled: boolean;
    streamTickMs: number;
    toggleStreamEnabled: () => void;
    setStreamTickMs: (tickMs: number) => void;
}

const clampTickMs = (tickMs: number) => Math.min(1000, Math.max(40, tickMs));

export const useChatUiStore = create<ChatUiStore>((set) => ({
    streamEnabled: false,
    streamTickMs: 120,
    toggleStreamEnabled: () => set((state) => ({ streamEnabled: !state.streamEnabled })),
    setStreamTickMs: (tickMs) => set({ streamTickMs: clampTickMs(tickMs) }),
}));
