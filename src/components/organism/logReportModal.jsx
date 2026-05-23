import Button from "../atoms/button";
import Modal from "../atoms/modal";
import NativeSelect from "../atoms/nativeSelect";

const LogReportModal = ({
  open,
  onClose,
  year,
  onYearChange,
  yearOptions,
  currentYear,
  onConfirm,
  loading,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generar reporte de actividades"
      className="max-w-lg"
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-600">
          Selecciona el año desde el cual quieres incluir registros. El PDF se
          generará desde {currentYear} hasta el año seleccionado.
        </p>

        <div className="grid gap-4">
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
