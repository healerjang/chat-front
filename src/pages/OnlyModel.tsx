import { useEffect, useState, type ReactNode } from "react";
import SideBar from "@/components/SideBar/SideBar.tsx";
import UserChat from "@/components/UserChat.tsx";
import type {
    ContentBlockControlApi,
    ContentBlockSide,
} from "@/components/ContentBlock/ContentBlock.tsx";
import "./OnlyModel.scss";

export interface OnlyModelViewOption {
    label: string;
    content: string;
}

export interface OnlyModelContentData {
    content: string;
    viewOptions?: readonly OnlyModelViewOption[];
    modelIconPath?: string;
    rawData?: Record<string, unknown>;
}

export interface OnlyModelPageProps {
    initialItems?: readonly OnlyModelContentData[];
    items?: readonly OnlyModelContentData[];
    title?: string;
    description?: string;
    inputPlaceholder?: string;
    displayMode?: "contained" | "fullArea";
    hideSidebar?: boolean;
    getSide?: (item: OnlyModelContentData, index: number) => ContentBlockSide;
    renderControl?: (
        api: ContentBlockControlApi<OnlyModelContentData>,
        item: OnlyModelContentData,
        index: number,
    ) => ReactNode;
    onSubmit?: (content: string) => void;
}

const renderViewOptionControl = (
    api: ContentBlockControlApi<OnlyModelContentData>,
    item: OnlyModelContentData,
) => {
    if (!item.viewOptions || item.viewOptions.length <= 1) {
        return undefined;
    }

    return (
        <div className="onlyModelViewControl">
            {item.viewOptions.map((option) => (
                <button
                    key={option.label}
                    type="button"
                    onClick={() => api.setViewingContent(option.content)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

const OnlyModelPage = ({
    initialItems = [],
    items: controlledItems,
    title = "Only Model Chat",
    description = "Model messages are arranged left and right.",
    inputPlaceholder = "Add a model message.",
    displayMode = "contained",
    hideSidebar = false,
    getSide = (_, index) => index % 2 === 0 ? "left" : "right",
    renderControl = renderViewOptionControl,
    onSubmit,
}: OnlyModelPageProps) => {
    const [items, setItems] = useState<OnlyModelContentData[]>([...initialItems]);
    const renderedItems = controlledItems ?? items;

    useEffect(() => {
        if (controlledItems) {
            return;
        }

        setItems([...initialItems]);
    }, [controlledItems, initialItems]);

    const addContent = (content: string) => {
        if (onSubmit) {
            onSubmit(content);
            return;
        }

        if (!controlledItems) {
            setItems((prev) => [...prev, { content }]);
        }
    };

    return (
        <div className="main">
            {!hideSidebar && <SideBar></SideBar>}
            <div className="mainView">
                <UserChat<OnlyModelContentData>
                    displayMode={displayMode}
                    title={title}
                    description={description}
                    items={renderedItems}
                    getContent={(item) => item.content}
                    getSide={getSide}
                    getModelIconPath={(item) => item.modelIconPath}
                    getRawData={(item) => item.rawData ?? item}
                    renderControl={renderControl}
                    onSubmit={addContent}
                    inputPlaceholder={inputPlaceholder}
                />
            </div>
        </div>
    );
};

export default OnlyModelPage;
