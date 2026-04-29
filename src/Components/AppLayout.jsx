import { Outlet } from "react-router-dom";
import SideBar from "./Organism/SideBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />
      <main className="md:pl-24 pt-20 md:pt-6 p-6">
        <Outlet />
      </main>
    </div>
  );
}