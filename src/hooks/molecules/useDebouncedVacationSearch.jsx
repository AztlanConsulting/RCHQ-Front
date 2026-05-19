import { useEffect, useState } from "react";

const DEFAULT_MIN_SEARCH_LENGTH = 2;
const DEFAULT_DEBOUNCE_MS = 350;

const normalizeSearch = (value) => value.trim().replace(/\s+/g, " ");

export const useDebouncedVacationSearch = (
    initialValue = "",
    {
        minSearchLength = DEFAULT_MIN_SEARCH_LENGTH,
        debounceMs = DEFAULT_DEBOUNCE_MS,
    } = {},
) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

    useEffect(() => {
        const timer = setTimeout(() => {
            const normalizedValue = normalizeSearch(inputValue);

            if (normalizedValue.length === 0) {
                setDebouncedSearch("");
                return;
            }

            if (normalizedValue.length < minSearchLength) {
                setDebouncedSearch("");
                return;
            }

            setDebouncedSearch(normalizedValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [inputValue, debounceMs, minSearchLength]);

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
