import { Outlet } from "react-router-dom";
import SideBar from "./Organism/SideBar";

export default function AppLayout() {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <SideBar />
      <main
        className="h-screen overflow-y-auto py-4 pr-6 pt-20 md:pt-4"
        style={{ paddingLeft: "104px" }}
      >
        <Outlet />
      </main>
    </div>
  );
}