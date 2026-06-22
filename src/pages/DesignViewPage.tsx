import { useState } from "react";
import SideBar from "@/components/SideBar/SideBar.tsx";
import UserChat from "@/components/UserChat.tsx";
import {
    renderThinkControl,
    type UserParticipationContentData,
} from "@/pages/UserParticipation.tsx";
import "./DesignViewPage.scss";

const designViewItems: UserParticipationContentData[] = [
    {
        role: "model",
        content: "# Design View\n\nThis page follows `UserParticipationContentData` and expands the viewing area to fill every pixel beside the sidebar.",
        think: "The first design test should remove the centered card constraint and let the chat surface occupy the full main view.",
        rawData: { role: "model", turn: 1, type: "design-intro" },
    },
    {
        role: "user",
        content: "사이드바를 제외한 전체 영역에서 메시지 폭, 스크롤, Markdown 스타일을 확인하고 싶어.",
        rawData: { role: "user", turn: 2, type: "design-request" },
    },
    {
        role: "model",
        content: "## Markdown Surface Test\n\n- Left and right bubbles remain visually distinct.\n- The conversation area uses the full available height.\n- Long content should scroll inside the expanded viewing surface.\n\n```tsx\n<UserChat displayMode=\"fullArea\" />\n```",
        think: "The page should reuse the existing control behavior so the design test still exercises content switching through Think and Answer.",
        rawData: { role: "model", turn: 3, type: "markdown-surface" },
    },
    {
        role: "user",
        content: "좋아. 다음 디자인 변경도 여기서 계속 비교할 수 있게 해줘.",
        rawData: { role: "user", turn: 4, type: "follow-up" },
    },
];

const DesignViewPage = () => {
    const [items, setItems] = useState<UserParticipationContentData[]>(designViewItems);

    const addUserContent = (content: string) => {
        setItems((prev) => [...prev, { role: "user", content }]);
    };

    return (
        <div className="main designViewPage">
            <SideBar></SideBar>
            <div className="mainView designViewPage__mainView">
                <UserChat<UserParticipationContentData>
                    displayMode="fullArea"
                    title="Design View"
                    description="UserParticipation UX with a full-size viewing area."
                    items={items}
                    getContent={(item) => item.content}
                    getSide={(item) => item.role === "model" ? "left" : "right"}
                    getModelIconPath={(item) => item.role === "model" ? item.modelIconPath : undefined}
                    getRawData={(item) => item.rawData ?? item}
                    getStreamable={(item) => item.role === "model"}
                    renderControl={renderThinkControl}
                    onSubmit={addUserContent}
                    inputPlaceholder="디자인 테스트용 유저 메시지를 추가하세요."
                />
            </div>
        </div>
    );
};

export default DesignViewPage;
