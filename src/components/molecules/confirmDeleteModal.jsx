import Button from "../atoms/button";

const ConfirmDeleteModal = ({
    label,
    onConfirm,
    onCancel,
    loading,
    mode = "delete",
}) => {
    if (!label) return null;

    const config = {
        delete: {
            title: "Eliminar documento",
            body: (
                <>
                    ¿Seguro que quiere eliminar{" "}
                    <span className="font-semibold text-slate-700">
                        {label}
                    </span>
                    ? Esta acción no se puede revertir.
                </>
            ),
            confirmText: loading ? "Eliminando..." : "Eliminar",
            confirmColor: "bg-[#dd4344]",
            confirmHover: "hover:bg-red-700",
            confirmActive: "active:bg-red-800",
        },
        replace: {
            title: "Documento ya existe",
            body: (
                <>
                    <span className="font-semibold text-slate-700">
                        {label}
                    </span>{" "}
                    ya existe. ¿Desea reemplazarlo?
                </>
            ),
            confirmText: loading ? "Reemplazando..." : "Reemplazar",
            confirmColor: "bg-[#dd4344]",
            confirmHover: "hover:bg-red-700",
            confirmActive: "active:bg-red-800",
        },
    };

    const {
        title,
        body,
        confirmText,
        confirmColor,
        confirmHover,
        confirmActive,
    } = config[mode];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-slate-900">
                    {title}
                </h3>
                <p className="text-sm text-slate-500">{body}</p>
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
