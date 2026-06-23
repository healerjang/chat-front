import { create } from "zustand";

export type PageName =
    | "survivalDebate"
    | "newChat"
    | "onlyModel"
    | "userParticipation"
    | "designView"
    | "testOnlyModel"
    | "testUserParticipation";

export const PAGE_LABEL_MAP = {
    survivalDebate: "Survival Debate",
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
    pageName: "survivalDebate",
    setPage: (pageName) => set({ pageName }),
    initialState: () => set({ pageName: "survivalDebate" }),
}));
