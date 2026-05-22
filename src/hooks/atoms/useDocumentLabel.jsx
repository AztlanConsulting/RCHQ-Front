// hooks/Atoms/useDocumentLabel.js

export const useDocumentLabel = (documentTypes = []) => {
  const getLabel = (typeValue) => {
    const found = documentTypes.find((dt) => dt.value === typeValue);
    return found ? found.label : typeValue;
  };

  return { getLabel };
};
