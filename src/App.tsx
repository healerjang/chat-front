import { PAGE_COMPONENT_MAP, usePageStore } from "@/stores/usePageStore.tsx";

function App() {
    const pageName = usePageStore(state => state.pageName);
    const Page = PAGE_COMPONENT_MAP[pageName];

    return <Page />;
}

export default App;