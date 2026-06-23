import { useCallback, useEffect, useMemo, useState } from "react";
import OnlyModelPage, { type OnlyModelContentData } from "@/pages/OnlyModel.tsx";
import SideBar from "@/components/SideBar/SideBar.tsx";
import "./SurvivalDebate.scss";

type TurnType = "dialog" | "vote" | "Dialog" | "Vote";
type Ai = "Gpt" | "Gemini" | "Claude" | "Grok" | "DeepSeek";
type ScoreStatus = "stable" | "watch" | "unstable" | "critical" | "Stable" | "Watch" | "Unstable" | "Critical";

interface ScoreItems {
    involvement: number;
    contribution: number;
    attention: number;
}

interface Send {
    send_type: TurnType;
    sender: Ai;
    answer?: string | null;
    think?: string | null;
    proposal?: string | null;
    another_model_evaluations?: Partial<Record<Ai, string>> | null;
    score_status?: ScoreStatus | null;
    vote?: Partial<Record<Ai, number>> | null;
    scores?: Partial<Record<Ai, ScoreItems>> | null;
}

interface ModelResponse {
    sends: Send[];
    is_retry: boolean;
}

const formatModelName = (model: string) => model.charAt(0).toUpperCase() + model.slice(1);

const formatModelEvaluations = (
    entries: Partial<Record<Ai, string>> | null | undefined,
) => {
    if (!entries || Object.keys(entries).length === 0) {
        return undefined;
    }

    const sections = Object.entries(entries)
        .filter((entry): entry is [Ai, string] => entry[1] !== undefined && entry[1] !== null && entry[1].trim().length > 0)
        .map(([model, evaluation]) => `### ${formatModelName(model)}\n\n${evaluation}`);

    return sections.length > 0
        ? `## Another Model Evaluations\n\n${sections.join("\n\n")}`
        : undefined;
};

const formatMap = <TValue,>(
    title: string,
    entries: Partial<Record<Ai, TValue>> | null | undefined,
    formatValue: (value: TValue) => string,
) => {
    if (!entries || Object.keys(entries).length === 0) {
        return "";
    }

    const lines = Object.entries(entries)
        .filter((entry): entry is [Ai, TValue] => entry[1] !== undefined && entry[1] !== null)
        .map(([model, value]) => `- ${formatModelName(model)}: ${formatValue(value)}`);

    return lines.length > 0 ? `\n\n### ${title}\n${lines.join("\n")}` : "";
};

const isVoteTurn = (send: Send) => send.send_type.toString().toLowerCase() === "vote";

const formatVoteContent = (send: Send) => {
    const voteSection = formatMap("Vote", send.vote, (value) => String(value));

    return `## ${formatModelName(send.sender)} Vote\n${voteSection || "\nNo vote data."}`;
};

const formatEvaluationContent = (send: Send) => {
    const modelEvaluations = formatModelEvaluations(send.another_model_evaluations);
    const scoreSection = formatMap(
        "Scores",
        send.scores,
        (value) => `involvement ${value.involvement}, contribution ${value.contribution}, attention ${value.attention}`,
    );
    const scoreStatusSection = send.score_status ? `\n\n### Score Status\n${send.score_status}` : "";
    const sections = [modelEvaluations, scoreSection, scoreStatusSection].filter(Boolean);

    return `## ${formatModelName(send.sender)} Evaluation\n\n${sections.join("\n\n") || "No evaluation data."}`;
};

const sendToContent = (send: Send) => {
    if (isVoteTurn(send)) {
        return formatVoteContent(send);
    }

    const sections = [
        send.answer ?? send.proposal ?? send.think,
        formatMap("Vote", send.vote, (value) => String(value)),
        formatMap(
            "Scores",
            send.scores,
            (value) => `involvement ${value.involvement}, contribution ${value.contribution}, attention ${value.attention}`,
        ),
        send.score_status ? `### Score Status\n${send.score_status}` : undefined,
    ].filter(Boolean);

    const fallback = send.send_type.toString().toLowerCase() === "vote"
        ? "Vote result received."
        : "No message content.";

    return `## ${formatModelName(send.sender)}\n\n${sections.join("\n\n") || fallback}`;
};

const sendToViewOptions = (send: Send) => {
    const sender = formatModelName(send.sender);
    const modelEvaluations = formatModelEvaluations(send.another_model_evaluations);

    if (isVoteTurn(send)) {
        return [
            {
                label: "Vote",
                content: formatVoteContent(send),
            },
            {
                label: "Evaluation",
                content: formatEvaluationContent(send),
            },
            {
                label: "Think",
                content: `## ${sender} Think\n\n${send.think ?? "No think data."}`,
            },
        ];
    }

    const options = [
        {
            label: "Answer",
            content: `## ${sender} Answer\n\n${send.answer ?? "No answer."}`,
        },
        send.think
            ? {
                label: "Think",
                content: `## ${sender} Think\n\n${send.think}`,
            }
            : undefined,
        send.proposal
            ? {
                label: "Proposal",
                content: `## ${sender} Proposal\n\n${send.proposal}`,
            }
            : undefined,
        modelEvaluations
            ? {
                label: "Evaluations",
                content: modelEvaluations,
            }
            : undefined,
    ].filter((option): option is { label: string; content: string } => Boolean(option));

    return options.length > 0 ? options : undefined;
};

const responseToItems = (response: ModelResponse): OnlyModelContentData[] => (
    response.sends.map((send) => ({
        content: sendToContent(send),
        viewOptions: sendToViewOptions(send),
        rawData: send as unknown as Record<string, unknown>,
    }))
);

const fetchModelResponse = async (path: "/history" | "/next" | "/retry") => {
    const response = await fetch(path, {
        method: path === "/history" ? "GET" : "POST",
    });

    if (!response.ok) {
        throw new Error(`${path} failed with ${response.status}`);
    }

    return await response.json() as ModelResponse;
};

const SurvivalDebatePage = () => {
    const [items, setItems] = useState<OnlyModelContentData[]>([]);
    const [isRetry, setIsRetry] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadResponse = useCallback(async (path: "/history" | "/next" | "/retry") => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetchModelResponse(path);
            setItems(responseToItems(response));
            setIsRetry(response.is_retry);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Request failed.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadResponse("/history");
    }, [loadResponse]);

    const statusText = useMemo(() => {
        if (isLoading) {
            return "Loading server data...";
        }

        if (errorMessage) {
            return errorMessage;
        }

        return `${items.length} sends loaded${isRetry ? " after retry" : ""}.`;
    }, [errorMessage, isLoading, isRetry, items.length]);

    return (
        <div className="main survivalDebate">
            <SideBar />
            <div className="survivalDebate__main">
                <div className="survivalDebate__toolbar">
                    <div>
                        <h1>Survival Debate</h1>
                        <p>{statusText}</p>
                    </div>
                    <div className="survivalDebate__actions">
                        <button type="button" onClick={() => void loadResponse("/history")} disabled={isLoading}>
                            History
                        </button>
                        <button type="button" onClick={() => void loadResponse("/next")} disabled={isLoading}>
                            Next
                        </button>
                        <button type="button" onClick={() => void loadResponse("/retry")} disabled={isLoading}>
                            Retry
                        </button>
                    </div>
                </div>
                <OnlyModelPage
                    hideSidebar
                    displayMode="fullArea"
                    title="Survival Debate"
                    description="Responses are loaded from the local backend server."
                    inputPlaceholder="Use Next or Retry to request server progress."
                    items={items}
                    getSide={(_, index) => index % 2 === 0 ? "left" : "right"}
                />
            </div>
        </div>
    );
};

export default SurvivalDebatePage;
