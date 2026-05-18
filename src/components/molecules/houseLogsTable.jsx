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
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center text-gray-500">
          Cargando registros...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center text-gray-500">
          No hay registros para los filtros seleccionados
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-100">
          <tr>
            <th className="px-7 py-5 text-center text-sm font-bold text-[#121212]">
              Nombre del responsable
            </th>
            <th className="px-7 py-5 text-center text-sm font-bold text-[#121212]">
              CURP del responsable
            </th>
            <th className="px-7 py-5 text-center text-sm font-bold text-[#121212]">
              Acción
            </th>
            <th className="px-7 py-5 text-center text-sm font-bold text-[#121212]">
              Afectado
            </th>
            <th className="px-7 py-5 text-center text-sm font-bold text-[#121212]">
              Fecha
            </th>
            <th className="px-7 py-5 text-center text-sm font-bold text-[#121212]">
              IP
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.logId} className="border-t border-gray-200 align-top">
              <td className="px-7 py-5 text-center text-sm font-semibold text-[#666666]">
                <TruncatedCell value={log.responsibleName} widthClassName="mx-auto w-full" />
              </td>
              <td className="px-7 py-5 text-center text-sm font-semibold uppercase text-[#8C8C8C]">
                {renderCellValue(log.responsibleCurp)}
              </td>
              <td className="px-7 py-5 text-center text-sm font-semibold text-[#8C8C8C]">
                <TruncatedCell value={log.action} widthClassName="mx-auto w-full" />
              </td>
              <td className="px-7 py-5 text-center text-sm font-semibold text-[#8C8C8C]">
                <TruncatedCell value={log.affectedName} widthClassName="mx-auto w-full" />
              </td>
              <td className="px-7 py-5 text-center text-sm font-semibold text-[#8C8C8C]">
                {formatLogMoment(log.moment)}
              </td>
              <td className="px-7 py-5 text-center text-sm font-semibold text-[#8C8C8C]">
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
