import UserParticipationPage, {
    type UserParticipationContentData,
} from "@/pages/UserParticipation.tsx";

const testUserParticipationItems: UserParticipationContentData[] = [
    {
        role: "user",
        content: "현재 프로젝트에서 Markdown이 섞인 문자열도 같은 UI로 보여주고 싶습니다.",
        rawData: { role: "user", turn: 1, type: "request" },
    },
    {
        role: "model",
        content: "가능합니다. `ContentBlock`은 기본적으로 `content`를 렌더링하고, control 조작 시 다른 문자열로 전환합니다.",
        think: "사용자 요구는 string viewing UI의 일관성입니다. 페이지별 책임은 배치와 데이터 주입으로 제한하고, 렌더링 책임은 ContentBlock에 둡니다.",
        rawData: { role: "model", turn: 2, type: "answer-with-think" },
    },
    {
        role: "user",
        content: "목록과 코드 블록도 깨지지 않아야 합니다.",
        rawData: { role: "user", turn: 3, type: "constraint" },
    },
    {
        role: "model",
        content: "### 지원 스타일\n1. 문단과 제목\n2. `inline code`\n3. 코드 블록\n\n```tsx\n<ContentBlock content={content} />\n```",
        think: "Markdown 문법이 있으면 블록 단위 렌더링을 적용하고, 없으면 단일 문단으로 처리합니다.",
        rawData: { role: "model", turn: 4, type: "markdown-answer" },
    },
];

const TestUserParticipationPage = () => {
    return <UserParticipationPage initialItems={testUserParticipationItems} />;
};

export default TestUserParticipationPage;
