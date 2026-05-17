import { useEffect, useState } from "react";

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_MS = 350;

const normalizeSearch = (value) => value.trim().replace(/\s+/g, " ");

export const useDebouncedVacationSearch = (initialValue = "") => {
    const [inputValue, setInputValue] = useState(initialValue);
    const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

    useEffect(() => {
        const timer = setTimeout(() => {
            const normalizedValue = normalizeSearch(inputValue);

            if (normalizedValue.length === 0) {
                setDebouncedSearch("");
                return;
            }

            if (normalizedValue.length < MIN_SEARCH_LENGTH) {
                setDebouncedSearch("");
                return;
            }

            setDebouncedSearch(normalizedValue);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [inputValue]);

    const clearSearch = () => {
        setInputValue("");
        setDebouncedSearch("");
    };

    return {
        inputValue,
        setInputValue,
        debouncedSearch,
        clearSearch,
    };
};