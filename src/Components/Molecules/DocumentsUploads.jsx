import Alert from "../Atoms/Alerts";
import Button from "../Atoms/Button";
import SelectField from "../Atoms/SelectField";

const DocumentUploadModal = ({
  isOpen,
  onClose,
  isEditing,
  documentTypeValue,
  setDocumentType,
  documentOptions,
  fileName,
  handleFileChange,
  handleSubmit,
  displayError,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
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

        {displayError && <Alert type="error" message={displayError} />}

        <SelectField
          label="Tipo de documento"
          id="document-type"
          value={documentTypeValue}
          setValue={setDocumentType}
          options={documentOptions}
          placeholder="Selecciona un tipo"
          labelColor="text-slate-700"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700">
            {isEditing ? "Reemplazar archivo (opcional)" : "Archivo"}
          </label>
          <label
            htmlFor="doc-file-input"
            className={`flex items-center justify-between min-h-[50px] w-full rounded-lg px-4 bg-neutral-50 shadow-[inset_0px_4px_4px_#00000040] cursor-pointer border-2 border-dashed transition-colors ${fileName ? "border-[#1e2b4d]" : "border-slate-300 hover:border-slate-400"}`}
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

        <div className="flex gap-3 justify-end pt-2">
          <Button
            text="Cancelar"
            onClick={onClose}
            bgColor="bg-transparent"
            hoverColor="hover:bg-slate-100"
            activeColor="active:bg-slate-200"
            textColor="text-slate-600"
            width="w-auto"
            height="h-[42px]"
            textSize="text-sm"
            fontWeight="font-medium"
            className="px-4"
          />
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
