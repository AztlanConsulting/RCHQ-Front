import { Outlet } from "react-router-dom";
import SideBar from "./Components/Organism/SideBar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <main className="min-w-0 flex-1 p-6 md:pt-6 pt-20">
        <Outlet />
      </main>
    </div>
  );
}