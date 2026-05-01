import { useState, useCallback } from "react";

export const useField = (maxLength = 255) => {
  const [value, setValue] = useState("");

  const handleValue = useCallback(
    (newValue) => {
      setValue(newValue.slice(0, maxLength));
    },
    [maxLength],
  );

  return { value, handleValue };
};
