import { useState } from "react";
import './SideBar.scss'
import { useChatUiStore } from "@/stores/useChatUiStore.tsx";
import { PAGE_LABEL_MAP, usePageStore, type PageName } from "@/stores/usePageStore.tsx";

type SideBarTab = "pages" | "tools";

const StreamIcon = () => (
    <svg className="sideBar__streamIcon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h3l2.2-5 5.6 10L17 12h3" />
        <path d="M5 18c4.4 2.4 9.6 2.4 14 0" />
        <path d="M5 6c4.4-2.4 9.6-2.4 14 0" />
    </svg>
);

const SideBar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<SideBarTab>("pages");
    const pageName = usePageStore((state) => state.pageName);
    const setPage = usePageStore((state) => state.setPage);
    const streamEnabled = useChatUiStore((state) => state.streamEnabled);
    const streamTickMs = useChatUiStore((state) => state.streamTickMs);
    const toggleStreamEnabled = useChatUiStore((state) => state.toggleStreamEnabled);
    const setStreamTickMs = useChatUiStore((state) => state.setStreamTickMs);
    const pageEntries = Object.entries(PAGE_LABEL_MAP) as [PageName, string][];

    return (
        <aside className={collapsed ? "sideBar sideBar--collapsed" : "sideBar"}>
            <div className="sideBar__top">
                {!collapsed && <div className="sideBar__title">Chat Front</div>}
                <button
                    type="button"
                    className="sideBar__collapseButton"
                    onClick={() => setCollapsed((prev) => !prev)}
                    aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                >
                    {collapsed ? ">" : "<"}
                </button>
            </div>

            {collapsed ? (
                <div className="sideBar__collapsedRail">
                    <button
                        type="button"
                        className={streamEnabled ? "sideBar__streamButton sideBar__streamButton--active" : "sideBar__streamButton"}
                        onClick={toggleStreamEnabled}
                        title="Stream output"
                        aria-pressed={streamEnabled}
                    >
                        <StreamIcon />
                    </button>
                </div>
            ) : (
                <>
                    <div className="sideBar__tabs" role="tablist" aria-label="sidebar tabs">
                        <button
                            type="button"
                            className={activeTab === "pages" ? "sideBar__tab sideBar__tab--active" : "sideBar__tab"}
                            onClick={() => setActiveTab("pages")}
                        >
                            Pages
                        </button>
                        <button
                            type="button"
                            className={activeTab === "tools" ? "sideBar__tab sideBar__tab--active" : "sideBar__tab"}
                            onClick={() => setActiveTab("tools")}
                        >
                            Tools
                        </button>
                    </div>

                    {activeTab === "pages" && (
                        <nav className="sideBar__nav" aria-label="page navigation">
                            {pageEntries.map(([name, label]) => (
                                <button
                                    key={name}
                                    type="button"
                                    className={pageName === name ? "sideBar__button sideBar__button--active" : "sideBar__button"}
                                    onClick={() => setPage(name)}
                                >
                                    {label}
                                </button>
                            ))}
                        </nav>
                    )}

                    {activeTab === "tools" && (
                        <section className="sideBar__tools" aria-label="sidebar tools">
                            <div className="sideBar__toolRow">
                                <button
                                    type="button"
                                    className={streamEnabled ? "sideBar__streamButton sideBar__streamButton--active" : "sideBar__streamButton"}
                                    onClick={toggleStreamEnabled}
                                    title="Stream output"
                                    aria-label="Stream output"
                                    aria-pressed={streamEnabled}
                                >
                                    <StreamIcon />
                                </button>
                                <label className="sideBar__tickControl">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={streamTickMs}
                                        aria-label="Stream tick milliseconds"
                                        onChange={(event) => {
                                            const nextValue = event.target.value;
                                            if (/^\d+$/.test(nextValue)) {
                                                setStreamTickMs(Number(nextValue));
                                            }
                                        }}
                                    />
                                    <span>ms</span>
                                </label>
                            </div>
                        </section>
                    )}
                </>
            )}
        </aside>
    );
};

export default SideBar;
