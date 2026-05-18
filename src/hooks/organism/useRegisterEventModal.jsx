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
    value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g, "");

const normalizeRole = (role) =>
    String(role ?? "")
        .trim()
        .toLowerCase();

const canViewCategory = (option, role) => {
    const normalizedRole = normalizeRole(role);

    if (option.value === "casa" || option.value === "ausencias") {
        return normalizedRole === "coordinador";
    }

    if (option.value === "global") {
        return normalizedRole === "admin";
    }

    return true;
};

export const useRegisterEventModal = (isOpen, categoryForms) => {
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
                canViewCategory(option, viewerRole),
        );
    }, [categoryForms, viewerRole]);

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
