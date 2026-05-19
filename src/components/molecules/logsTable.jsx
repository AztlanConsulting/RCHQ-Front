const getImportanceBadgeStyles = (important) => {
  return important
    ? "bg-red-100 text-red-700"
    : "bg-slate-100 text-slate-600";
};

const LogsTable = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-8 text-center text-gray-500">Cargando logs...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-8 text-center text-gray-500">
          No hay registro de actividades disponibles para esta casa.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[980px]">
        <thead className="border-b border-gray-200 bg-gray-100">
          <tr>
            <th className="px-4 py-4 text-center text-sm font-bold text-[#121212]">Fecha</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-[#121212]">Acción</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-[#121212]">Responsable</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-[#121212]">CURP</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-[#121212]">Afectado</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-[#121212]">IP</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-[#121212]">Importancia</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.logId} className="border-b border-gray-100 last:border-b-0">
              <td className="px-4 py-4 text-center text-sm text-slate-700">{log.momentLabel}</td>
              <td className="px-4 py-4 text-sm text-slate-700">{log.action}</td>
              <td className="px-4 py-4 text-center text-sm text-slate-700">{log.responsibleName}</td>
              <td className="px-4 py-4 text-center text-sm text-slate-700">{log.responsibleCurp}</td>
              <td className="px-4 py-4 text-center text-sm text-slate-700">{log.affectedName || "-"}</td>
              <td className="px-4 py-4 text-center text-sm text-slate-700">{log.ipAddress}</td>
              <td className="px-4 py-4 text-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getImportanceBadgeStyles(log.important)}`}
                >
                  {log.important ? "Importante" : "Normal"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
