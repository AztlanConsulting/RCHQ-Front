import Button from "../atoms/button";

const ConfirmDeleteModal = ({
  label,
  onConfirm,
  onCancel,
  loading,
  mode = "delete",
  title,
  body,
  inline = false,
}) => {
  if (!label) return null;

  const config = {
    delete: {
      title: "Eliminar documento",
      body: (
        <>
          ¿Seguro que quiere eliminar{" "}
          <span className="font-semibold text-slate-700">{label}</span>?{" "}
          Esta acción no se puede revertir.
        </>
      ),
      confirmText: loading ? "Eliminando..." : "Eliminar",
      confirmColor: "bg-[#A20000]",
      confirmHover: "hover:bg-[#870000]",
      confirmActive: "active:bg-[#6B0000]",
    },
    replace: {
      title: "Documento ya existe",
      body: (
        <>
          <span className="font-semibold text-slate-700">{label}</span> ya
          existe. ¿Desea reemplazarlo?
        </>
      ),
      confirmText: loading ? "Reemplazando..." : "Reemplazar",
      confirmColor: "bg-[#A20000]",
      confirmHover: "hover:bg-[#870000]",
      confirmActive: "active:bg-[#6B0000]",
    },
  };

  const {
    title: defaultTitle,
    body: defaultBody,
    confirmText,
    confirmColor,
    confirmHover,
    confirmActive,
  } = config[mode];

  const wrapperClass = inline
    ? "absolute inset-0 z-30 flex items-center justify-center p-4"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4";

  const cardClass = inline
    ? "w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
    : "w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl";

  return (
    <div className={wrapperClass}>
      {inline ? <div className="absolute inset-0 rounded-xl bg-white/65" aria-hidden /> : null}
      <div className={`${cardClass} relative flex flex-col gap-4`}>
        <h3 className="text-lg font-semibold text-slate-900">{title ?? defaultTitle}</h3>
        <div className="text-sm text-slate-500">{body ?? defaultBody}</div>
        <div className="flex gap-3 justify-end">
          <Button
            text="Cancelar"
            onClick={onCancel}
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
            text={confirmText}
            onClick={onConfirm}
            disabled={loading}
            bgColor={confirmColor}
            hoverColor={confirmHover}
            activeColor={confirmActive}
            textColor="text-white"
            width="w-auto"
            height="h-[42px]"
            textSize="text-sm"
            fontWeight="font-semibold"
            className="px-4"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
