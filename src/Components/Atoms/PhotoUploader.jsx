import { useRef, useState, useEffect } from "react";

const CloudUploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-10 h-10 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16v-8m0 0-3 3m3-3 3 3M6.5 19a4.5 4.5 0 01-.5-8.97V10a5 5 0 019.9-1A4.5 4.5 0 0117.5 19H6.5z"
    />
  </svg>
);

const PhotoUploader = ({
  file,
  onFileChange,
  label = "Foto del Usuario",
  labelColor = "text-[#121212]",
  accept = "image/*",
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const selected = e.target.files?.[0] || null;
    onFileChange(selected);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className={`font-semibold text-sm ${labelColor}`}>{label}</label>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label="Subir fotografía"
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        className="
          relative h-[130px] flex flex-col items-center justify-center gap-2
          bg-neutral-50 rounded-lg shadow-[inset_0px_4px_4px_#00000040]
          cursor-pointer transition-colors hover:bg-neutral-100
          overflow-hidden
        "
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Vista previa"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Eliminar foto"
              className="
                absolute top-2 right-2 z-10
                w-7 h-7 rounded-full bg-black/50 text-white
                flex items-center justify-center text-xs
                hover:bg-black/70 transition-colors
              "
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <CloudUploadIcon />
            <span className="font-bold text-base text-[#121212]">
              Subir Fotografía
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
      />
    </div>
  );
};

export default PhotoUploader;
