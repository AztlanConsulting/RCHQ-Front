const DEFAULT_COLUMNS = ["Foto", "Nombre Completo", "Puesto", "Estado", "Acciones"];

const EmployeeTable = ({
  employees,
  loading,
  error,
  columns = DEFAULT_COLUMNS,
  renderRow,
  emptyMessage = "No hay registros disponibles",
  loadingMessage = "Cargando...",
}) => {
  const isEmpty = !employees || employees.length === 0;

  const stateContent = loading
    ? <div className="p-8 text-center text-gray-500">{loadingMessage}</div>
    : error
    ? <div className="p-8 text-center text-red-500">Error: {error}</div>
    : isEmpty
    ? <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
    : null;

  if (stateContent) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        {stateContent}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-6 py-4 text-center font-bold text-sm text-[#121212]">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((item, i) => renderRow(item, i))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;