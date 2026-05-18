import SideBar from "./organism/sideBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <SideBar />
      <main
        className="h-screen overflow-y-auto pb-4 pt-20 max-md:px-4 md:px-0 md:pb-4 md:pl-[104px] md:pr-6 md:pt-4"
      >
        <Outlet />
      </main>
    </div>
  );
}