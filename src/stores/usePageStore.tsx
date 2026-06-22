import { create } from "zustand";
import NewChat from "@/pages/NewChat.tsx";
import type { ComponentType } from "react";

export const PAGE_COMPONENT_MAP = {
    newChat: NewChat,
} satisfies Record<string, ComponentType>;

export type PageName = keyof typeof PAGE_COMPONENT_MAP;

interface PageStore {
    pageName: PageName;
    setPage: (pageName: PageName) => void;
    initialState: () => void;
}

export const usePageStore = create<PageStore>((set) => ({
    pageName: "newChat",
    setPage: (pageName) => set({ pageName }),
    initialState: () => set({ pageName: "newChat" }),
}));