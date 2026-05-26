import { useRef, useState } from "react";

const defaultSanitize = (value) =>
  value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

const defaultLength = (value) => value.trim().length;

const useSearch = (
  initialValue = "",
  onSearch,
  {
    sanitize = defaultSanitize,
    getSearchLength = defaultLength,
    transformSearchValue = (value) => value,
  } = {},
) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const lastSearchValue = useRef(initialValue);

  const search = (value) => {
    const transformedValue = transformSearchValue(value);

    if (lastSearchValue.current === transformedValue) return;

    lastSearchValue.current = transformedValue;
    onSearch(transformedValue);
  };

  const handleChange = (value) => {
    const sanitizedValue = sanitize(value);
    const searchLength = getSearchLength(sanitizedValue);

    setInputValue(sanitizedValue);

    if (searchLength === 0) {
      search("");
      return;
    }

    if (searchLength % 3 === 0) {
      search(sanitizedValue);
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
