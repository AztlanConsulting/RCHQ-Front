import { useRef, useState } from "react";

const useSearch = (initialValue = "", onSearch) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const lastSearchValue = useRef(initialValue);

  const search = (value) => {
    if (lastSearchValue.current === value) return;

    lastSearchValue.current = value;
    onSearch(value);
  };

  const handleChange = (value) => {
    const onlyLetters = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    const searchLength = onlyLetters.trim().length;

    setInputValue(onlyLetters);

    if (searchLength === 0) {
      search("");
      return;
    }

    if (searchLength % 3 === 0) {
      search(onlyLetters);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search(inputValue);
    }
  };

  return {
    inputValue,
    handleChange,
    handleKeyDown,
  };
};

export default useSearch;
