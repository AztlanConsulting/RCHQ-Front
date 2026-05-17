import { useEffect, useMemo, useRef, useState } from "react";

export const useEmployeeSearchSelect = ({
    employees = [],
    selected = [],
    onSearch,
    onSelect,
}) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    const updatePosition = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        setDropdownPos({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        });
    };

    useEffect(() => {
        const handler = (e) => {
            const outsideContainer =
                containerRef.current &&
                !containerRef.current.contains(e.target);

            const outsideDropdown =
                dropdownRef.current && !dropdownRef.current.contains(e.target);

            if (outsideContainer && outsideDropdown) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);

        return () => {
            document.removeEventListener("mousedown", handler);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const update = () => updatePosition();

        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update);

        return () => {
            window.removeEventListener("scroll", update, true);
            window.removeEventListener("resize", update);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!onSearch) return;

        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const selectedIds = useMemo(() => {
        return new Set(selected.map((employee) => employee.employeeId));
    }, [selected]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(
            (employee) => !selectedIds.has(employee.employeeId),
        );
    }, [employees, selectedIds]);

    const handleInputChange = (value) => {
        setQuery(value);
        updatePosition();
        setIsOpen(true);
    };

    const openDropdown = () => {
        updatePosition();
        setIsOpen(true);
    };

    const handleSelect = (employee) => {
        onSelect(employee);
        setQuery("");
        setIsOpen(false);
    };

    return {
        query,
        isOpen,
        dropdownPos,
        containerRef,
        dropdownRef,
        filteredEmployees,
        handleInputChange,
        openDropdown,
        handleSelect,
    };
};
