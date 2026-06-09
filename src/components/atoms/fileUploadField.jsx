const FileUploadField = ({
    id = "file-input",
    label,
    labelColor = "text-slate-700",
    fileName,
    onFileChange,
    placeholder = "Selecciona un archivo",
    accept,
    helperText = "",
    required = false,
    buttonText = "Examinar",
}) => (
    <div className="flex w-full flex-col gap-1.5">
        {label ? (
            <label className={`text-sm font-bold sm:text-base ${labelColor}`}>
                {label}
                {required ? (
                    <span className="ml-0.5 text-red-600" aria-hidden="true">
                        *
                    </span>
                ) : null}
            </label>
        ) : null}

        <label
            htmlFor={id}
            className={`flex min-h-[50px] w-full cursor-pointer items-center justify-between rounded-lg border-2 border-dashed bg-neutral-50 px-4 shadow-[inset_0px_4px_4px_#00000040] transition-colors ${
                fileName
                    ? "border-[#1e2b4d]"
                    : "border-slate-300 hover:border-slate-400"
            }`}
        >
            <span
                className={`truncate text-sm font-medium ${
                    fileName ? "text-[#222]" : "text-[#aaaaaa]"
                }`}
            >
                {fileName || placeholder}
            </span>

            <span className="ml-3 shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-[#1e2b4d]">
                {buttonText}
            </span>
        </label>

        <input
            id={id}
            type="file"
            accept={accept}
            onChange={onFileChange}
            className="hidden"
        />

        {helperText ? (
            <p className="text-xs text-slate-400">{helperText}</p>
        ) : null}
    </div>
);

export default FileUploadField;
