import { useEffect, useState, useCallback, useMemo } from "react";
import { getCalendarViewerRole } from "../../services/calendarService";

const CATEGORY_OPTIONS = [
    { value: "global", label: "Global", icon: "globe" },
    { value: "casa", label: "Casa", icon: "home" },
    { value: "personal", label: "Personal", icon: "user" },
    { value: "vacaciones", label: "Vacaciones", icon: "plane" },
    { value: "ausencias", label: "Ausencias", icon: "flag" },
];

const DEFAULT_CATEGORY = "personal";

const sanitizeName = (value) =>
    value
        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g, "")
        .slice(0, 70);

const normalizeRole = (role) =>
    String(role ?? "")
        .trim()
        .toLowerCase();

const canViewCategory = (option, role, startDate) => {
    if (!startDate) return true;

    const normalizedRole = normalizeRole(role);
    const todayMX = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

    const addTime = (dateStr, months = 0, years = 0) => {
        const d = new Date(dateStr + "T12:00:00");
        d.setMonth(d.getMonth() + months);
        d.setFullYear(d.getFullYear() + years);
        return d.toISOString().split('T')[0];
    };

    const oneYearFromTodayMX = addTime(todayMX, 0, 1);
    const oneMonthAgoMX = addTime(todayMX, -1, 0);
    const currentYear = new Date().getFullYear();
    const houseDateMin = `${currentYear}-01-01`;
    const houseDateMax = `${currentYear + 2}-12-31`;

    if (option.value === "vacaciones") {
        if (normalizedRole === "coordinador") {
            return startDate >= todayMX && startDate <= oneYearFromTodayMX;
        }
        if (normalizedRole !== "administrador") {
            return startDate > todayMX && startDate <= oneYearFromTodayMX;
        }
        return false;
    }

    if (option.value === "casa") {
        return normalizedRole === "coordinador" && startDate >= houseDateMin && startDate <= houseDateMax;
    }

    if (option.value === "ausencias") {
        return normalizedRole === "coordinador" && startDate >= oneMonthAgoMX && startDate <= oneYearFromTodayMX;
    }

    if (option.value === "global") {
        return normalizedRole === "administrador" && startDate >= todayMX;
    }

    return startDate >= todayMX;
};

export const useRegisterEventModal = (isOpen, categoryForms, initialStartDate) => {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [categoryKey, setCategoryKey] = useState(DEFAULT_CATEGORY);
    const [validationAlert, setValidationAlert] = useState(null);
    const [animationKey, setAnimationKey] = useState(0);

    const viewerRole = getCalendarViewerRole();

    const visibleCategoryOptions = useMemo(() => {
        return CATEGORY_OPTIONS.filter(
            (option) =>
                categoryForms?.[option.value] &&
                canViewCategory(option, viewerRole, initialStartDate),
        );
    }, [categoryForms, viewerRole, initialStartDate]);

    const visibleCategoryValues = visibleCategoryOptions.map(
        ({ value }) => value,
    );

    const effectiveCategoryKey = visibleCategoryValues.includes(categoryKey)
        ? categoryKey
        : (visibleCategoryOptions[0]?.value ?? DEFAULT_CATEGORY);

    const SubForm = categoryForms?.[effectiveCategoryKey] ?? null;

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setNameError("");
            setCategoryKey(DEFAULT_CATEGORY);
            setValidationAlert(null);
            setAnimationKey(0);
        }
    }, [isOpen]);

    const handleNameChange = useCallback((value) => {
        setName(sanitizeName(value));
        setNameError("");
    }, []);

    const handleCategoryChange = useCallback((value) => {
        setCategoryKey(value);
        setAnimationKey((prev) => prev + 1);
        setNameError("");
        setValidationAlert(null);
    }, []);

    return {
        name,
        nameError,
        categoryKey,
        validationAlert,
        animationKey,
        visibleCategoryOptions,
        effectiveCategoryKey,
        SubForm,
        setNameError,
        setValidationAlert,
        handleNameChange,
        handleCategoryChange,
    };
};
