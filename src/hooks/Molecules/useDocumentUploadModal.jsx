import { useState, useEffect } from "react";
import { useField } from "../Atoms/useField";
import { useDocumentFile } from "../Atoms/useDocumentFile";

export const useDocumentUploadModal = ({ editingDocument, isOpen, onSubmit }) => {
  const documentType = useField();
  const { file, fileName, error: fileError, handleFileChange, reset: resetFile } = useDocumentFile();
  const [localError, setLocalError] = useState("");

  const isEditing = Boolean(editingDocument);
  const { handleValue: setDocumentType } = documentType;

  useEffect(() => {
    setDocumentType(editingDocument?.type || "");
    resetFile();
  }, [editingDocument, isOpen, setDocumentType, resetFile]);

  const handleSubmit = () => {
    setLocalError("");

    if (!documentType.value) {
      setLocalError("Selecciona el tipo de documento.");
      return;
    }
    if (!isEditing && !file) {
      setLocalError("Selecciona un archivo para subir.");
      return;
    }

    const formData = new FormData();
    formData.append("documentField", documentType.value);
    if (file) formData.append("file", file);

    onSubmit(formData);
  };

  const displayError = localError || fileError;

  return {
    isEditing,
    documentType,
    fileName,
    handleFileChange,
    handleSubmit,
    displayError,
  };
};