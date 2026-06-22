import { useState } from "react";
import SideBar from "@/components/SideBar/SideBar.tsx";
import UserChat from "@/components/UserChat.tsx";
import "./OnlyModel.scss";

export interface OnlyModelContentData {
    content: string;
    modelIconPath?: string;
    rawData?: Record<string, unknown>;
}

export interface OnlyModelPageProps {
    initialItems?: readonly OnlyModelContentData[];
}

const OnlyModelPage = ({ initialItems = [] }: OnlyModelPageProps) => {
    const [items, setItems] = useState<OnlyModelContentData[]>([...initialItems]);

    const addContent = (content: string) => {
        setItems((prev) => [...prev, { content }]);
    };

    return (
        <div className="main">
            <SideBar></SideBar>
            <div className="mainView">
                <UserChat<OnlyModelContentData>
                    title="Only Model Chat"
                    description="모델 메시지를 좌우로 번갈아 배치합니다."
                    items={items}
                    getContent={(item) => item.content}
                    getSide={(_, index) => index % 2 === 0 ? "left" : "right"}
                    getModelIconPath={(item) => item.modelIconPath}
                    getRawData={(item) => item.rawData ?? item}
                    onSubmit={addContent}
                    inputPlaceholder="모델 메시지 더미 데이터를 추가하세요."
                />
            </div>
        </div>
    );
};

export default OnlyModelPage;
