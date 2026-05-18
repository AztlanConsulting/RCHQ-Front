import { formatLogMoment } from "../../hooks/pages/useHouseLogs";

const renderCellValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
};

const TruncatedCell = ({ value, widthClassName = "" }) => {
  const displayValue = renderCellValue(value);

  return (
    <div className={`group relative ${widthClassName}`}>
      <span className="block truncate">{displayValue}</span>
      {value ? (
        <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden max-w-xs rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
          <span className="block whitespace-normal break-words">{value}</span>
        </div>
      ) : null}
    </div>
  );
};

const HouseLogsTable = ({ logs, loading, error }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        Cargando registros...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-red-500 shadow-sm">
        Error: {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        No hay registros para los filtros seleccionados
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[980px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-4 text-left text-sm font-bold text-[#121212]">
              Nombre del responsable
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-[#121212]">
              CURP del responsable
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-[#121212]">
              Acción
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-[#121212]">
              Afectado
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-[#121212]">
              Fecha
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-[#121212]">
              IP
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.logId} className="border-t border-gray-200 align-top">
              <td className="px-4 py-6 text-sm font-semibold text-[#666666]">
                <TruncatedCell value={log.responsibleName} widthClassName="max-w-[18rem]" />
              </td>
              <td className="px-4 py-6 text-sm font-semibold uppercase text-[#8C8C8C]">
                {renderCellValue(log.responsibleCurp)}
              </td>
              <td className="max-w-[18rem] px-4 py-6 text-sm font-semibold text-[#8C8C8C]">
                <TruncatedCell value={log.action} widthClassName="max-w-[18rem]" />
              </td>
              <td className="max-w-[12rem] px-4 py-6 text-sm font-semibold text-[#8C8C8C]">
                <TruncatedCell value={log.affectedName} widthClassName="max-w-[12rem]" />
              </td>
              <td className="px-4 py-6 text-sm font-semibold text-[#8C8C8C]">
                {formatLogMoment(log.moment)}
              </td>
              <td className="px-4 py-6 text-sm font-semibold text-[#8C8C8C]">
                {renderCellValue(log.ipAddress)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HouseLogsTable;
