const displayNameFromEmployee = (employee) => {
  if (!employee || typeof employee !== "object") return "";
  const { name, surname, lastName } = employee;
  return `${name ?? ""} ${surname ?? lastName ?? ""}`.trim();
};

const ReactivateCard = ({
  isOpen,
  employee,
  employeeName,
  isSubmitting,
  onSubmit,
  onCancel,
}) => {
  if (!isOpen) return null;

  const resolvedName =
    (typeof employeeName === "string" && employeeName.trim()) ||
    displayNameFromEmployee(employee) ||
    "este empleado";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reactivate-dialog-title"
    >
      <div className="mx-4 flex w-full max-w-lg flex-col gap-6 rounded-2xl bg-white p-8 shadow-xl">
        <p
          id="reactivate-dialog-title"
          className="text-center text-xl font-semibold leading-snug text-gray-900"
        >
          ¿Reactivar a &quot;{resolvedName}&quot;?
        </p>

        <p className="text-center text-sm text-gray-600">
          El empleado volverá a estar activo en el sistema. Puedes cancelar si no
          deseas continuar.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7FD447] hover:text-black active:bg-[#7FD447] active:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Procesando..." : "Reactivar"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-[#1e3a5f] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162d4a] active:bg-[#102040] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactivateCard;
