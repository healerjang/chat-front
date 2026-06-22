import type { ComponentType } from "react";
import type { PageName } from "@/stores/usePageStore.tsx";
import NewChat from "@/pages/NewChat.tsx";
import OnlyModelPage from "@/pages/OnlyModel.tsx";
import UserParticipationPage from "@/pages/UserParticipation.tsx";
import DesignViewPage from "@/pages/DesignViewPage.tsx";
import TestOnlyModelPage from "@/pages/TestOnlyModelPage.tsx";
import TestUserParticipationPage from "@/pages/TestUserParticipationPage.tsx";

export const PAGE_COMPONENT_MAP = {
    newChat: NewChat,
    onlyModel: OnlyModelPage,
    userParticipation: UserParticipationPage,
    designView: DesignViewPage,
    testOnlyModel: TestOnlyModelPage,
    testUserParticipation: TestUserParticipationPage,
} satisfies Record<PageName, ComponentType>;
