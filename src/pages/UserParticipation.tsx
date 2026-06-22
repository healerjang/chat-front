import { useState } from "react";
import SideBar from "@/components/SideBar/SideBar.tsx";
import UserChat from "@/components/UserChat.tsx";
import type { ContentBlockControlApi } from "@/components/ContentBlock/ContentBlock.tsx";
import "./UserParticipation.scss";

export type ChatRole = "model" | "user";

export interface UserParticipationContentData {
    role: ChatRole;
    content: string;
    think?: string;
    modelIconPath?: string;
    rawData?: Record<string, unknown>;
}

export interface UserParticipationPageProps {
    initialItems?: readonly UserParticipationContentData[];
}

export const renderThinkControl = (
    api: ContentBlockControlApi<UserParticipationContentData>,
    item: UserParticipationContentData,
) => {
    if (item.role !== "model" || !item.think) {
        return undefined;
    }

    return (
        <div className="thinkControl">
            <button
                type="button"
                onMouseEnter={() => api.setViewingContent(item.think ?? item.content)}
                onMouseLeave={api.resetViewingContent}
                onFocus={() => api.setViewingContent(item.think ?? item.content)}
                onBlur={api.resetViewingContent}
            >
                Think
            </button>
            <button type="button" onClick={() => api.setViewingContent(item.content)}>
                Answer
            </button>
        </div>
    );
};

const UserParticipationPage = ({ initialItems = [] }: UserParticipationPageProps) => {
    const [items, setItems] = useState<UserParticipationContentData[]>([...initialItems]);

    const addUserContent = (content: string) => {
        setItems((prev) => [...prev, { role: "user", content }]);
    };

    return (
        <div className="main">
            <SideBar></SideBar>
            <div className="mainView">
                <UserChat<UserParticipationContentData>
                    title="User Participation Chat"
                    description="모델은 왼쪽, 유저는 오른쪽에 배치합니다."
                    items={items}
                    getContent={(item) => item.content}
                    getSide={(item) => item.role === "model" ? "left" : "right"}
                    getModelIconPath={(item) => item.role === "model" ? item.modelIconPath : undefined}
                    getRawData={(item) => item.rawData ?? item}
                    getStreamable={(item) => item.role === "model"}
                    renderControl={renderThinkControl}
                    onSubmit={addUserContent}
                    inputPlaceholder="유저 메시지를 추가하세요."
                />
            </div>
        </div>
    );
};

export default UserParticipationPage;
