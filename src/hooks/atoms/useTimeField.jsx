import { useEffect, useMemo, useRef, useState } from "react";

export const generateTimes = (stepMinutes = 15) => {
    const times = [];

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += stepMinutes) {
            const hour12 = h % 12 === 0 ? 12 : h % 12;
            const ampm = h < 12 ? "a.m." : "p.m.";
            const minuteLabel = String(m).padStart(2, "0");
            const baseLabel = `${hour12}:${minuteLabel} ${ampm}`;
            const label =
                m === 0 && h === 0
                    ? `${baseLabel} (medianoche)`
                    : m === 0 && h === 12
                      ? `${baseLabel} (mediodía)`
                      : baseLabel;

            times.push({
                label,
                value: `${String(h).padStart(2, "0")}:${minuteLabel}`,
            });
        }
    }

    return times;
};

export const useTimeField = ({
    value = "",
    minTime,
    disabled = false,
    onChange,
    stepMinutes = 15,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({
        top: 0,
        left: 0,
        width: 0,
        maxHeight: 200,
    });

    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    const allTimes = useMemo(() => generateTimes(stepMinutes), [stepMinutes]);

    const times = allTimes.filter((time) => {
        if (minTime && time.value <= minTime) return false;
        return true;
    });

    const selectedLabel =
        allTimes.find((time) => time.value === value)?.label || "";

    const updateDropdownPosition = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const desiredHeight = 200;
        const spaceBelow = viewportHeight - rect.bottom - 12;
        const spaceAbove = rect.top - 12;
        const shouldOpenUpward =
            spaceBelow < desiredHeight && spaceAbove > spaceBelow;
        const maxHeight = Math.max(
            120,
            Math.min(
                desiredHeight,
                shouldOpenUpward ? spaceAbove : spaceBelow,
            ),
        );

        setDropdownPos({
            top: shouldOpenUpward
                ? Math.max(8, rect.top - maxHeight - 4)
                : rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            maxHeight,
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
