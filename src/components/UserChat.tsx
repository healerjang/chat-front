import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import ContentBlock, {
    type ContentBlockControlApi,
    type ContentBlockRawData,
    type ContentBlockSide,
} from "@/components/ContentBlock/ContentBlock.tsx";
import "./UserChat.scss";

export interface UserChatProps<TData extends ContentBlockRawData = ContentBlockRawData> {
    variant?: "panel" | "composer";
    displayMode?: "contained" | "fullArea";
    title?: string;
    description?: string;
    items?: readonly TData[];
    getContent?: (item: TData, index: number) => string;
    getSide?: (item: TData, index: number) => ContentBlockSide;
    getModelIconPath?: (item: TData, index: number) => string | undefined;
    getRawData?: (item: TData, index: number) => ContentBlockRawData | undefined;
    getStreamable?: (item: TData, index: number) => boolean;
    renderControl?: (api: ContentBlockControlApi<TData>, item: TData, index: number) => ReactNode;
    onSubmit?: (content: string) => void;
    inputPlaceholder?: string;
}

const getStringField = (item: ContentBlockRawData, key: string) => {
    const value = (item as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
};

const UserChat = <TData extends ContentBlockRawData = ContentBlockRawData>({
    variant = "panel",
    displayMode = "contained",
    title = "AI Chat",
    description = "문자열과 Markdown을 동일한 채팅 UI로 표시합니다.",
    items = [],
    getContent = (item) => getStringField(item, "content") ?? "",
    getSide = (_, index) => (index % 2 === 0 ? "left" : "right"),
    getModelIconPath = (item) => getStringField(item, "modelIconPath"),
    getRawData = (item) => item,
    getStreamable = () => true,
    renderControl,
    onSubmit,
    inputPlaceholder = "다음 메시지를 입력하세요.",
}: UserChatProps<TData>) => {
    const [draft, setDraft] = useState("");
    const conversationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const conversation = conversationRef.current;
        if (!conversation) {
            return;
        }

        conversation.scrollTo({
            top: conversation.scrollHeight,
            behavior: "smooth",
        });
    }, [items.length]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const content = draft.trim();
        if (!content || !onSubmit) {
            return;
        }

        onSubmit(content);
        setDraft("");
    };

    if (variant === "composer") {
        return (
            <form className="userChatComposer" onSubmit={handleSubmit}>
                <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={inputPlaceholder}
                    aria-label="chat message"
                />
                <button type="submit" disabled={!onSubmit || draft.trim().length === 0}>
                    Send
                </button>
            </form>
        );
    }

    return (
        <section className={`userChat userChat--${displayMode}`} aria-label={title}>
            <header className="userChat__header">
                <div>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </header>
            <div className="userChat__conversation" ref={conversationRef}>
                {items.length === 0 ? (
                    <div className="userChat__empty">표시할 메시지가 없습니다.</div>
                ) : (
                    items.map((item, index) => (
                        <ContentBlock<TData>
                            key={`${index}-${getContent(item, index).slice(0, 24)}`}
                            content={getContent(item, index)}
                            side={getSide(item, index)}
                            modelIconPath={getModelIconPath(item, index)}
                            rawData={getRawData(item, index)}
                            streamable={getStreamable(item, index)}
                            renderControl={
                                renderControl
                                    ? (api) => renderControl(api, item, index)
                                    : undefined
                            }
                        />
                    ))
                )}
            </div>
            <form className="userChat__inputPanel" onSubmit={handleSubmit}>
                <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={inputPlaceholder}
                    aria-label="chat message"
                />
                <button type="submit" disabled={!onSubmit || draft.trim().length === 0}>
                    Send
                </button>
            </form>
        </section>
    );
};

export default UserChat;
