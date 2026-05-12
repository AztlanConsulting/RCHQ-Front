import sideBar from "./organism/SideBar";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import button from "./atoms/button";
import useAuth from "../hooks/useAuth";

const navLinkClass = ({ isActive }) =>
  `block rounded px-3 py-2 text-sm ${
    isActive ? "bg-slate-700 text-white" : "text-black"
  }`;

export default function AppLayout() {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <sideBar />
      <main
        className="h-screen overflow-y-auto py-4 pr-6 pt-20 md:pt-4"
        style={{ paddingLeft: "104px" }}
      >
        <Outlet />
      </main>
    </div>
  );
}