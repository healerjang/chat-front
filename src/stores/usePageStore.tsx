import { create } from "zustand";

export type PageName =
    | "newChat"
    | "onlyModel"
    | "userParticipation"
    | "designView"
    | "testOnlyModel"
    | "testUserParticipation";

export const PAGE_LABEL_MAP = {
    newChat: "New Chat",
    onlyModel: "Only Model",
    userParticipation: "User Participation",
    designView: "Design View",
    testOnlyModel: "Test Only Model",
    testUserParticipation: "Test User Participation",
} satisfies Record<PageName, string>;

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
