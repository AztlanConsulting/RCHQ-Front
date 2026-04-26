import { useState, useCallback } from "react";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024;

export const useDocumentFile = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Solo se permiten archivos PDF, PNG o JPG.");
      setFile(null);
      setFileName("");
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError("El archivo no puede superar los 10 MB.");
      setFile(null);
      setFileName("");
      return;
    }

    setError("");
    setFile(selected);
    setFileName(selected.name);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setFileName("");
    setError("");
  }, []);

  return { file, fileName, error, handleFileChange, reset };
};