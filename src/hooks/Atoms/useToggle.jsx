import { useState } from "react";

export const useToggle = (initialState = false) => {
    const [value, setValue] = useState(initialState);

    const toggleShowValue = () =>{
        setValue((value) => !value);
    }

    return {value, toggleShowValue};
}