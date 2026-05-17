import Button from "../atoms/button";
import Modal from "../atoms/modal";
import NativeSelect from "../atoms/nativeSelect";

const monthOptions = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const LogReportModal = ({
  open,
  onClose,
  month,
  onMonthChange,
  year,
  onYearChange,
  yearOptions,
  onConfirm,
  loading,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generar reporte de logs"
      className="max-w-lg"
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-600">
          Selecciona el mes y el año del reporte que quieres descargar en PDF.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mes
            </label>
            <NativeSelect
              value={month}
              onChange={(event) => onMonthChange(Number(event.target.value))}
              options={monthOptions}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Año
            </label>
            <NativeSelect
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
              options={yearOptions.map((optionYear) => ({
                value: optionYear,
                label: String(optionYear),
              }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            text="Cancelar"
            onClick={onClose}
            bgColor="bg-slate-100"
            hoverColor="hover:bg-slate-200"
            activeColor="active:bg-slate-300"
            textColor="text-slate-700"
            width="w-full sm:w-36"
            textSize="text-base"
          />
          <Button
            text={loading ? "Generando..." : "Descargar PDF"}
            onClick={onConfirm}
            disabled={loading}
            bgColor="bg-[#24375e]"
            hoverColor="hover:bg-[#162d4a]"
            activeColor="active:bg-[#0f2035]"
            textColor="text-white"
            width="w-full sm:w-44"
            textSize="text-base"
            className="disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
    </Modal>
  );
};

export default LogReportModal;
