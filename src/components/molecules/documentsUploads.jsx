import Alert from "../atoms/alerts";
import Button from "../atoms/button";
import SelectField from "../atoms/selectField";
import DocumentFileField from "./documentFileField";

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6"
        onClick={(event) => event.stopPropagation()}
      >
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

        <DocumentFileField
          label={isEditing ? "Reemplazar archivo (opcional)" : "Archivo"}
          fileName={fileName}
          handleFileChange={handleFileChange}
        />

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
