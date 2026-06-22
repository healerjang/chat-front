import SideBar from "@/components/SideBar/SideBar.tsx";
import UserChat from "@/components/UserChat.tsx";

const UserParticipation = () => {
    return (
        <div className="main">
            <SideBar></SideBar>
            <div className="mainView">
                <UserChat></UserChat>
            </div>
        </div>
    );
};

export default UserParticipation;