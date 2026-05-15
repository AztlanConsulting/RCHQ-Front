import SideBar from "./organism/sideBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            <SideBar />
            <main className="h-screen overflow-y-auto py-4 pr-6 pt-20 md:pt-4 md:pl-[104px]">
                <Outlet />
            </main>
        </div>
    );
}
