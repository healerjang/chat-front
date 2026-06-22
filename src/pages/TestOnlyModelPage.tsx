import OnlyModelPage, { type OnlyModelContentData } from "@/pages/OnlyModel.tsx";

const testOnlyModelItems: OnlyModelContentData[] = [
    {
        content: "첫 번째 모델은 일반 문자열만 출력합니다. Markdown이 없어도 같은 버블 디자인으로 표시됩니다.",
        rawData: { model: "planner-ai", turn: 1, type: "plain" },
    },
    {
        content: "## 구현 제안\n- `ContentBlock`을 재사용 컴포넌트로 유지\n- 페이지는 배치 규칙만 담당\n\n`rawData`는 원본 추적용으로 보존합니다.",
        rawData: { model: "reviewer-ai", turn: 2, type: "markdown" },
    },
    {
        content: "> Markdown blockquote 테스트\n\n링크도 확인합니다: [React](https://react.dev)",
        rawData: { model: "docs-ai", turn: 3, type: "quote-link" },
    },
    {
        content: "```ts\nconst message = \"code block\";\nconsole.log(message);\n```",
        rawData: { model: "coder-ai", turn: 4, type: "code" },
    },
];

const TestOnlyModelPage = () => {
    return <OnlyModelPage initialItems={testOnlyModelItems} />;
};

export default TestOnlyModelPage;
