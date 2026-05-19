import { useEffect, useRef, useState } from "react";

export const generateTimes = () => {
    const times = [];

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour12 = h % 12 === 0 ? 12 : h % 12;
            const ampm = h < 12 ? "AM" : "PM";

            times.push({
                label: `${hour12}:${String(m).padStart(2, "0")} ${ampm}`,
                value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
            });
        }
    }

    return times;
};

const ALL_TIMES = generateTimes();

export const useTimeField = ({
    value = "",
    minTime,
    disabled = false,
    onChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    const times = ALL_TIMES.filter((time) => {
        if (minTime && time.value <= minTime) return false;
        return true;
    });

    const selectedLabel =
        ALL_TIMES.find((time) => time.value === value)?.label || "";

    const updateDropdownPosition = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        setDropdownPos({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        });
    };

    const handleOpen = () => {
        if (disabled) return;

        if (!isOpen) {
            updateDropdownPosition();
        }

        setIsOpen((prev) => !prev);
    };

    const handleSelect = (timeValue) => {
        onChange?.(timeValue);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedOutsideContainer =
                containerRef.current &&
                !containerRef.current.contains(event.target);

            const clickedOutsideDropdown =
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target);

            if (clickedOutsideContainer && clickedOutsideDropdown) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handlePositionUpdate = () => updateDropdownPosition();

        window.addEventListener("scroll", handlePositionUpdate, true);
        window.addEventListener("resize", handlePositionUpdate);

        return () => {
            window.removeEventListener("scroll", handlePositionUpdate, true);
            window.removeEventListener("resize", handlePositionUpdate);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !listRef.current || !value) return;

        const activeItem = listRef.current.querySelector(
            "[data-active='true']",
        );

        if (activeItem) {
            activeItem.scrollIntoView({ block: "center" });
        }
    }, [isOpen, value]);

    return {
        isOpen,
        dropdownPos,
        containerRef,
        dropdownRef,
        listRef,
        times,
        selectedLabel,
        handleOpen,
        handleSelect,
    };
};
