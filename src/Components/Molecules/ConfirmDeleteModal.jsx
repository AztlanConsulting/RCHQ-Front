import Button from "../Atoms/Button";

const ConfirmDeleteModal = ({ label, onConfirm, onCancel, loading }) => {
  if (!label) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Eliminar documento
        </h3>
        <p className="text-sm text-slate-500">
          ¿Estás seguro de que deseas eliminar{" "}
          <span className="font-semibold text-slate-700">{label}</span>? Esta
          acción no se puede deshacer.
        </p>
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
            text={loading ? "Eliminando..." : "Eliminar"}
            onClick={onConfirm}
            disabled={loading}
            bgColor="bg-[#dd4344]"
            hoverColor="hover:bg-red-700"
            activeColor="active:bg-red-800"
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
