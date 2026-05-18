const DocumentFileField = ({
    id = "doc-file-input",
    label = "Archivo",
    labelColor = "text-slate-700",
    fileName,
    handleFileChange,
    placeholder = "Selecciona un archivo (PDF, PNG, JPG)",
}) => (
    <div className="flex flex-col gap-1.5">
        {label ? (
            <label className={`text-sm font-bold sm:text-base ${labelColor}`}>
                {label}
            </label>
        ) : null}
        <label
            htmlFor={id}
            className={`flex items-center justify-between min-h-[50px] w-full rounded-lg px-4 bg-neutral-50 shadow-[inset_0px_4px_4px_#00000040] cursor-pointer border-2 border-dashed transition-colors ${fileName ? "border-[#1e2b4d]" : "border-slate-300 hover:border-slate-400"}`}
            >
            <span
                className={`text-sm font-medium truncate ${fileName ? "text-[#222]" : "text-[#aaaaaa]"}`}
            >
                {fileName || placeholder}
            </span>
            <span className="ml-3 shrink-0 text-xs font-semibold text-[#1e2b4d] bg-slate-100 rounded px-2 py-1">
                Examinar
            </span>
        </label>
        <input
            id={id}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
        />
        <p className="text-xs text-slate-400">
        {"Máximo 10 MB · PDF, PNG o JPG"}
        </p>
    </div>
);

export default DocumentFileField;
