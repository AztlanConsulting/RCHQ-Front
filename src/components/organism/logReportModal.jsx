import SmallButton from "../atoms/smallButton";
import Modal from "../atoms/modal";
import SelectField from "../atoms/selectField";

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
            <SelectField
              id="log-report-year"
              label="Año"
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
              options={yearOptions.map((optionYear) => ({
                value: optionYear,
                label: String(optionYear),
              }))}
              labelColor="text-slate-700"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <SmallButton
            text="Cancelar"
            onClick={onClose}
            cancel
            hasAdjustableWidth
            className="sm:w-36"
          />
          <SmallButton
            text={loading ? "Generando..." : "Descargar PDF"}
            onClick={onConfirm}
            disabled={loading}
            hasAdjustableWidth
            className="sm:w-44"
          />
        </div>
      </div>
    </Modal>
  );
};

export default LogReportModal;
