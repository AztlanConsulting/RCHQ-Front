import { useEffect, useState } from "react";

const useAlertAnimation = (message, onClose, duration = 5000) => {
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
    }, duration);

    return () => clearTimeout(displayTimer);
  }, [status, message, onClose, duration]);

  return status;
};

export default useAlertAnimation;
