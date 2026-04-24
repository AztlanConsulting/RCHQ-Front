import { useState } from "react";

export const useField = (maxLength = 255)=> {
    const [value, setValue] = useState("");

    const handleValue = (newValue) => {
    setValue(newValue.slice(0, maxLength));
  };

  return {value, handleValue}
}