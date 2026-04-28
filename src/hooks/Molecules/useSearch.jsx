import { useState } from "react";

const useSearch = (initialValue = "", onSearch) => {
    const [inputValue, setInputValue] = useState(initialValue);

    const handleChange = (value) => {
        const onlyLetters = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

        setInputValue(onlyLetters);

        if (onlyLetters.trim() === "") {
        onSearch("");

    }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onSearch(inputValue);
        }
    };

    return {
        inputValue,
        handleChange,
        handleKeyDown,
    };
};

export default useSearch;
