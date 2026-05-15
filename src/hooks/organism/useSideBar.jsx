import { useState, useEffect } from "react";

const SIDEBAR_KEY = "sidebar_expanded";

const useSideBar = () => {
    const [expanded, setExpanded] = useState(
        () => localStorage.getItem(SIDEBAR_KEY) === "true",
    );
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(SIDEBAR_KEY, expanded);
    }, [expanded]);

    const toggle = () => setExpanded((prev) => !prev);
    const openMobile = () => setMobileOpen(true);
    const closeMobile = () => setMobileOpen(false);

    return { expanded, toggle, mobileOpen, openMobile, closeMobile };
};

export default useSideBar;
