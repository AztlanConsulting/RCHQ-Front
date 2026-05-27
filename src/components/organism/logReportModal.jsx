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
          generará desde el año seleccionado hasta {currentYear}. Solo puedes
          elegir del año actual a 5 años atrás.
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

        <div className="flex justify-center gap-3 pt-2">
          <Button
            text="Cancelar"
            onClick={onClose}
            bgColor="bg-white"
            hoverColor="hover:bg-slate-50"
            activeColor="active:bg-slate-100"
            textColor="text-[#121212]"
            width="w-auto"
            height="h-[38px]"
            textSize="text-sm"
            fontWeight="font-bold"
            className="px-5 border border-slate-200 shadow-md"
          />
          <Button
            text={loading ? "Generando..." : "Descargar PDF"}
            onClick={onConfirm}
            disabled={loading}
            bgColor="bg-[#1F3664]"
            hoverColor="hover:bg-[#15284A]"
            activeColor="active:bg-[#0E1B33]"
            textColor="text-white"
            width="w-auto"
            height="h-[38px]"
            textSize="text-sm"
            fontWeight="font-bold"
            className="px-5 shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
    </Modal>
  );
};

export default LogReportModal;
