
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useChatUiStore } from "@/stores/useChatUiStore.tsx";
import "./ContentBlock.scss";

export type ContentBlockSide = "left" | "right";

export type ContentBlockRawData = object;

export interface ContentBlockControlApi<TData extends ContentBlockRawData = ContentBlockRawData> {
    content: string;
    defaultContent: string;
    rawData?: TData | ContentBlockRawData;
    setViewingContent: (content: string) => void;
    resetViewingContent: () => void;
}

export interface ContentBlockProps<TData extends ContentBlockRawData = ContentBlockRawData> {
    content: string;
    side?: ContentBlockSide;
    modelIconPath?: string;
    rawData?: TData | ContentBlockRawData;
    streamable?: boolean;
    renderControl?: (api: ContentBlockControlApi<TData>) => ReactNode;
}

interface MarkdownLine {
    text: string;
    ordered?: boolean;
}

const markdownPattern =
    /(^|\n)(#{1,6}\s|[-*]\s|\d+\.\s|>\s|```)|`[^`]+`|\[[^\]]+\]\([^)]+\)|(\*\*|__)[\s\S]+?(\*\*|__)|(^|\n)\s*[-*_]{3,}\s*($|\n)/;

const hasMarkdown = (content: string) => markdownPattern.test(content);

const renderInlineMarkdown = (text: string): ReactNode[] => {
    const nodes: ReactNode[] = [];
    const tokenPattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\[[^\]]+\]\([^)]+\))/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenPattern.exec(text)) !== null) {
        if (match.index > cursor) {
            nodes.push(text.slice(cursor, match.index));
        }

        const token = match[0];

        if (token.startsWith("`")) {
            nodes.push(<code key={`${match.index}-code`}>{token.slice(1, -1)}</code>);
        } else if (token.startsWith("**")) {
            nodes.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith("__")) {
            nodes.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
        } else {
            const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (linkMatch) {
                nodes.push(
                    <a key={`${match.index}-link`} href={linkMatch[2]} target="_blank" rel="noreferrer">
                        {linkMatch[1]}
                    </a>,
                );
            }
        }

        cursor = match.index + token.length;
    }

    if (cursor < text.length) {
        nodes.push(text.slice(cursor));
    }

    return nodes;
};

const flushList = (listItems: MarkdownLine[], key: string): ReactNode | null => {
    if (listItems.length === 0) {
        return null;
    }

    const Tag = listItems[0].ordered ? "ol" : "ul";

    return (
        <Tag key={key}>
            {listItems.map((item, index) => (
                <li key={`${key}-${index}`}>{renderInlineMarkdown(item.text)}</li>
            ))}
        </Tag>
    );
};

const renderMarkdown = (content: string): ReactNode[] => {
    const lines = content.split(/\r?\n/);
    const blocks: ReactNode[] = [];
    let paragraph: string[] = [];
    let listItems: MarkdownLine[] = [];
    let codeLines: string[] = [];
    let isCodeBlock = false;

    const flushParagraph = () => {
        if (paragraph.length === 0) {
            return;
        }

        const text = paragraph.join(" ");
        blocks.push(<p key={`p-${blocks.length}`}>{renderInlineMarkdown(text)}</p>);
        paragraph = [];
    };

    const flushCurrentList = () => {
        const list = flushList(listItems, `list-${blocks.length}`);
        if (list) {
            blocks.push(list);
        }
        listItems = [];
    };

    lines.forEach((line) => {
        if (line.trim().startsWith("```")) {
            if (isCodeBlock) {
                blocks.push(<pre key={`pre-${blocks.length}`}><code>{codeLines.join("\n")}</code></pre>);
                codeLines = [];
            } else {
                flushParagraph();
                flushCurrentList();
            }
            isCodeBlock = !isCodeBlock;
            return;
        }

        if (isCodeBlock) {
            codeLines.push(line);
            return;
        }

        if (line.trim() === "") {
            flushParagraph();
            flushCurrentList();
            return;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            flushParagraph();
            flushCurrentList();
            const level = headingMatch[1].length;
            const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            blocks.push(<Tag key={`h-${blocks.length}`}>{renderInlineMarkdown(headingMatch[2])}</Tag>);
            return;
        }

        const quoteMatch = line.match(/^>\s+(.+)$/);
        if (quoteMatch) {
            flushParagraph();
            flushCurrentList();
            blocks.push(<blockquote key={`quote-${blocks.length}`}>{renderInlineMarkdown(quoteMatch[1])}</blockquote>);
            return;
        }

        const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
        const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
        if (unorderedMatch || orderedMatch) {
            flushParagraph();
            const ordered = Boolean(orderedMatch);
            if (listItems.length > 0 && listItems[0].ordered !== ordered) {
                flushCurrentList();
            }
            listItems.push({ text: (unorderedMatch ?? orderedMatch)?.[1] ?? "", ordered });
            return;
        }

        paragraph.push(line.trim());
    });

    if (isCodeBlock && codeLines.length > 0) {
        blocks.push(<pre key={`pre-${blocks.length}`}><code>{codeLines.join("\n")}</code></pre>);
    }

    flushParagraph();
    flushCurrentList();

    return blocks;
};

const ContentBlock = <TData extends ContentBlockRawData = ContentBlockRawData>({
    content,
    side = "left",
    modelIconPath,
    rawData,
    streamable = true,
    renderControl,
}: ContentBlockProps<TData>) => {
    const [viewingContent, setViewingContent] = useState(content);
    const [displayContent, setDisplayContent] = useState(content);
    const [isStreaming, setIsStreaming] = useState(false);
    const completedContentRef = useRef(new Set<string>());
    const streamEnabled = useChatUiStore((state) => state.streamEnabled);
    const streamTickMs = useChatUiStore((state) => state.streamTickMs);

    useEffect(() => {
        completedContentRef.current.clear();
        setViewingContent(content);
        setDisplayContent(content);
        setIsStreaming(false);
    }, [content]);

    const streamWords = useMemo(() => viewingContent.match(/\S+\s*/g) ?? [viewingContent], [viewingContent]);

    useEffect(() => {
        const isCompleted = completedContentRef.current.has(viewingContent);

        if (!streamEnabled || !streamable || isCompleted) {
            setIsStreaming(false);
            setDisplayContent(viewingContent);
            return;
        }

        setIsStreaming(true);
        setDisplayContent("");

        let tickTimer: number | undefined;
        const loadingTimer = window.setTimeout(() => {
            let wordIndex = 0;
            tickTimer = window.setInterval(() => {
                wordIndex += 1;
                setDisplayContent(streamWords.slice(0, wordIndex).join(""));

                if (wordIndex >= streamWords.length) {
                    window.clearInterval(tickTimer);
                    completedContentRef.current.add(viewingContent);
                    setIsStreaming(false);
                }
            }, streamTickMs);
        }, 420);

        return () => {
            window.clearTimeout(loadingTimer);
            if (tickTimer) {
                window.clearInterval(tickTimer);
            }
        };
    }, [streamEnabled, streamTickMs, streamWords, streamable, viewingContent]);

    const controlApi: ContentBlockControlApi<TData> = {
        content: displayContent,
        defaultContent: content,
        rawData,
        setViewingContent,
        resetViewingContent: () => setViewingContent(content),
    };

    const renderedContent = isStreaming && displayContent.length === 0
        ? <p className="contentBlock__loading">Generating stream...</p>
        : hasMarkdown(displayContent)
            ? renderMarkdown(displayContent)
            : <p>{displayContent}</p>;

    return (
        <article className={`contentBlock contentBlock--${side}`}>
            {side === "left" && modelIconPath && (
                <img className="contentBlock__icon" src={modelIconPath} alt="" />
            )}
            <div className="contentBlock__body">
                {renderControl && (
                    <div className="contentBlock__control">
                        {renderControl(controlApi)}
                    </div>
                )}
                <div className="contentBlock__bubble">
                    {renderedContent}
                </div>
            </div>
            {side === "right" && modelIconPath && (
                <img className="contentBlock__icon" src={modelIconPath} alt="" />
            )}
        </article>
    );
};

export default ContentBlock;
