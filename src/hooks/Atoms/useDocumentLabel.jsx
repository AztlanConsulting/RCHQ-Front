// hooks/Atoms/useDocumentLabel.js
import { DOCUMENT_TYPES } from "../../Services/DocumentService";

export const useDocumentLabel = () => {
  const getLabel = (typeValue) => {
    const found = DOCUMENT_TYPES.find((dt) => dt.value === typeValue);
    return found ? found.label : typeValue;
  };

  return { getLabel };
};
