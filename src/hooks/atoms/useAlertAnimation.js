import { useEffect, useState } from "react";

const useAlertAnimation = (message, onClose) => {
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

    return status;
};

export default useAlertAnimation;
