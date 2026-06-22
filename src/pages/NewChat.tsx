import SideBar from "@/components/SideBar/SideBar.tsx";
import UserChat from "@/components/UserChat.tsx";
import "./NewChat.scss";

const NewChat = () => {
    return (
        <div className="main">
            <SideBar></SideBar>
            <div className="mainView">
                <div className="remainRegion"/>
                <UserChat variant="composer"></UserChat>
                <div className="remainRegion"/>
            </div>
        </div>
    );
};

export default NewChat;
