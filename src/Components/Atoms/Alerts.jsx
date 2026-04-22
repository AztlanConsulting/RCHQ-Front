import { useEffect, useState } from "react";
import error from "/error.svg";
import check from "/check.svg";

const Alert = ({ icon = "", type = "success", message, onClose }) => {
    const [status, setStatus] = useState("mounting");

    const styles = {
        success: {
            container: "bg-green-500 text-black",
            icon: check,
        },
        error: {
            container: "bg-[#ff7b7b] text-black",
            icon: error,
        },
        warning: {
            container: "bg-yellow-400 text-black",
            icon: icon,
        },
        info: {
            container: "bg-blue-500 text-white",
            icon: icon,
        },
    };

    const current = styles[type] || styles.info;

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus("visible");
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!onClose || status !== "visible") return;

        const displayTimer = setTimeout(() => {
            setStatus("exiting");
            setTimeout(() => {
                onClose();
            }, 300);
        }, 5000);

        return () => clearTimeout(displayTimer);
    }, [status, message, onClose]);

    return (
        <div
            className={`
                flex w-full items-center gap-3 p-4 rounded-lg shadow-md 
                transition-all duration-300 transform
                ${status === "mounting" ? "opacity-0 translate-y-[-20px]" : ""}
                ${status === "visible" ? "opacity-100 translate-y-0" : ""}
                ${status === "exiting" ? "opacity-0 -translate-y-4" : ""}
                ${current.container}
            `}
        >
            {current.icon && (
                <div className="flex shrink-0 items-center">
                    <img src={current.icon} alt={type} className="h-5 w-5" />
                </div>
            )}

            <div className="min-w-0 flex-1 text-sm font-medium whitespace-pre-line sm:text-base">
                {message}
            </div>
        </div>
    );
};

export default Alert;
