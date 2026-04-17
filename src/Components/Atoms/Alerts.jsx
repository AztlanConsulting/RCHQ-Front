import { useEffect, useState } from "react";
import errorIcon from "/error.svg";

const Alert = ({ icon = "", type = "success", message, onClose }) => {
  const [status, setStatus] = useState("mounting");

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

  const styles = {
    success: {
      container: "bg-green-500 text-black",
      icon: icon,
    },
    error: {
      container: "bg-[#FF7B7B] text-black",
      icon: errorIcon,
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
        flex items-center gap-3 p-4 rounded-lg shadow-md 
        transition-all duration-300 transform
        ${status === 'mounting' ? "opacity-0 translate-y-[-20px]" : ""}
        ${status === 'visible' ? "opacity-100 translate-y-0" : ""}
        ${status === 'exiting' ? "opacity-0 -translate-y-4" : ""}
        ${current.container}
      `}
    >
      {current.icon && <img src={current.icon} alt={type} className="h-5 w-5" />}
      <p className="font-medium whitespace-pre-line">{message}</p>
    </div>
  );
};

export default Alert;