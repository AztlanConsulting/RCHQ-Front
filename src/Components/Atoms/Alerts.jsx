import error from "/error.svg";
import check from "/check.svg";
import useAlertAnimation from "../../hooks/Atoms/useAlertAnimation";

const Alert = ({ icon = "", type = "success", message, onClose }) => {
    const status = useAlertAnimation(message, onClose);

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

    const current = styles[type];

    return (
        <div
            className={`
            flex w-full items-center gap-3 p-4 rounded-lg shadow-md
            transition-all duration-300 transform
            ${status === "mounting" ? "opacity-0 -translate-y-5" : ""}
            ${status === "visible" ? "opacity-100 translate-y-0" : ""}
            ${status === "exiting" ? "opacity-0 -translate-y-4" : ""}
            ${current.container}
        `}
        >
            {current.icon && <img src={current.icon} className="h-5 w-5" />}

            <div className="flex-1 whitespace-pre-line">{message}</div>
        </div>
    );
};

export default Alert;
