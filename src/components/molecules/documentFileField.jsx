import FileUploadField from "../atoms/fileUploadField";

const DocumentFileField = ({
    id = "doc-file-input",
    label = "Archivo",
    labelColor = "text-slate-700",
    fileName,
    handleFileChange,
    placeholder = "Selecciona un archivo (PDF, PNG, JPG)",
}) => (
    <FileUploadField
        id={id}
        label={label}
        labelColor={labelColor}
        fileName={fileName}
        onFileChange={handleFileChange}
        placeholder={placeholder}
        accept=".pdf,.png,.jpg,.jpeg"
        helperText="Máximo 10 MB · PDF, PNG o JPG"
    />
);

export default DocumentFileField;
