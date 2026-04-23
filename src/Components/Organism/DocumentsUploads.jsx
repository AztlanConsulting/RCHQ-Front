import { useState, useEffect } from "react";
import Alert from "../Atoms/Alerts";
import Button from "../Atoms/Button";
import { DOCUMENT_TYPES } from "../../Services/DocumentService";

/**
 * Organism: DocumentUploadModal
 * Handles both creating a new document and editing an existing one.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSubmit: (formData: FormData) => Promise<void>
 *  - editingDocument: object | null  — if set, prefills form for editing
 *  - loading: boolean
 *  - error: string
 */
const DocumentUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingDocument = null,
  loading = false,
  error = "",
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [localError, setLocalError] = useState("");

  const isEditing = Boolean(editingDocument);

  // Prefill when editing
  useEffect(() => {
    if (editingDocument) {
      setSelectedType(editingDocument.type || "");
      setFile(null);
      setFileName("");
    } else {
      setSelectedType("");
      setFile(null);
      setFileName("");
    }
    setLocalError("");
  }, [editingDocument, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!allowedTypes.includes(selected.type)) {
      setLocalError("Solo se permiten archivos PDF, PNG o JPG.");
      setFile(null);
      setFileName("");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setLocalError("El archivo no puede superar los 10 MB.");
      setFile(null);
      setFileName("");
      return;
    }

    setLocalError("");
    setFile(selected);
    setFileName(selected.name);
  };

  const handleSubmit = () => {
    setLocalError("");

    if (!selectedType) {
      setLocalError("Selecciona el tipo de documento.");
      return;
    }
    if (!isEditing && !file) {
      setLocalError("Selecciona un archivo para subir.");
      return;
    }

    const formData = new FormData();
    formData.append("documentField", selectedType);
    if (file) formData.append("file", file);

    onSubmit(formData);
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? "Editar documento" : "Subir documento"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {displayError && <Alert type="error" message={displayError} />}

        {/* Tipo de documento */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700">
            Tipo de documento
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full min-h-[50px] rounded-lg bg-neutral-50 px-4 border-0 shadow-[inset_0px_4px_4px_#00000040] text-sm font-medium text-[#222] outline-none cursor-pointer"
          >
            <option value="" disabled>
              Selecciona un tipo
            </option>
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        {/* File picker — usando label como trigger para evitar useRef */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700">
            {isEditing ? "Reemplazar archivo (opcional)" : "Archivo"}
          </label>

          <label
            htmlFor="doc-file-input"
            className={`
              flex items-center justify-between min-h-[50px] w-full rounded-lg px-4
              bg-neutral-50 shadow-[inset_0px_4px_4px_#00000040]
              cursor-pointer border-2 border-dashed transition-colors
              ${fileName ? "border-[#1e2b4d]" : "border-slate-300 hover:border-slate-400"}
            `}
          >
            <span
              className={`text-sm font-medium truncate ${fileName ? "text-[#222]" : "text-[#aaaaaa]"}`}
            >
              {fileName || "Selecciona un archivo (PDF, PNG, JPG)"}
            </span>
            <span className="ml-3 shrink-0 text-xs font-semibold text-[#1e2b4d] bg-slate-100 rounded px-2 py-1">
              Examinar
            </span>
          </label>

          <input
            id="doc-file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-xs text-slate-400">
            Máximo 10 MB · PDF, PNG o JPG
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          <Button
            text={
              loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Subir"
            }
            onClick={handleSubmit}
            disabled={loading}
            bgColor="bg-[#1e2b4d]"
            hoverColor="hover:bg-[#15203b]"
            activeColor="active:bg-[#0f172a]"
            textColor="text-white"
            width="w-auto"
            height="h-[42px]"
            textSize="text-sm"
            fontWeight="font-semibold"
            className="px-6"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
