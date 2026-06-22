import { usePageStore } from "@/stores/usePageStore.tsx";
import { PAGE_COMPONENT_MAP } from "@/pages/pageRegistry.tsx";

function App() {
    const pageName = usePageStore(state => state.pageName);
    const Page = PAGE_COMPONENT_MAP[pageName];

    return <Page />;
}

export default App;
