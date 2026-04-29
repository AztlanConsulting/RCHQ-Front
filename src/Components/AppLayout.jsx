import { Outlet } from "react-router-dom";
import SideBar from "./Organism/SideBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />
      <main
        className="px-6 pt-20 md:pt-6 pb-6"
        style={{ paddingLeft: "104px" }}
      >
        <Outlet />
      </main>
    </div>
  );
}