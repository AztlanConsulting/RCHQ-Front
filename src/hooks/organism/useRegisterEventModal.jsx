import { useEffect, useState, useCallback } from "react";

const DEFAULT_CATEGORY = "casa";

const sanitizeName = (value) =>
    value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g, "");

export const useRegisterEventModal = (isOpen) => {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [categoryKey, setCategoryKey] = useState(DEFAULT_CATEGORY);
    const [validationAlert, setValidationAlert] = useState(null);
    const [animationKey, setAnimationKey] = useState(0);

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
        setNameError,
        setValidationAlert,
        handleNameChange,
        handleCategoryChange,
    };
};