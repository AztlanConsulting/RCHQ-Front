import SmallButton from "../atoms/smallButton";

const EmployeeScheduleReminderModal = ({
  isOpen,
  employeeName,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const displayName = employeeName?.trim() || "el empleado";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-reminder-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/45 p-4"
    >
      <div className="flex w-full max-w-[400px] flex-col gap-5 rounded-2xl bg-white px-5 py-5 shadow-[0_10px_32px_rgba(0,0,0,0.18)] sm:px-7">
        <h2
          id="schedule-reminder-title"
          className="text-base font-bold leading-tight text-[#121212]"
        >
          Registra los horarios laborales
        </h2>

        <div className="flex max-h-52 flex-col gap-3 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3">
          <p className="text-sm leading-relaxed text-[#374151]">
            El empleado <span className="font-semibold text-[#1E3A5F]">{displayName}</span>{" "}
            fue registrado correctamente.
          </p>
          <p className="text-sm leading-relaxed text-[#374151]">
            Para que pueda solicitar vacaciones, ausencias y otros permisos, debes
            asignarle horarios laborales en la sección{" "}
            <span className="font-semibold text-[#1E3A5F]">Administrador</span> de su
            expediente.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <SmallButton
            text={isLoading ? "Redirigiendo..." : "Entendido"}
            onClick={onConfirm}
            disabled={isLoading}
            hasAdjustableWidth
            className="sm:w-[146px]"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeScheduleReminderModal;
