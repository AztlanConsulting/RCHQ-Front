/**
 * EmployeeRow — molecule genérica
 *
 * Props:
 *  - cells: Array de { key, content, className }
 *      Cada elemento es una celda del <tr>.
 *      content puede ser string, número o JSX.
 *  - actions: JSX con los botones (opcional).
 *             Si no se pasa, no se renderiza la última celda.
 */
const EmployeeRow = ({ cells = [], actions }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {cells.map(({ key, content, className = "" }) => (
        <td key={key} className={`px-6 py-4 text-center ${className}`}>
          {typeof content === "string" || typeof content === "number" ? (
            <p className="text-[#121212]">{content}</p>
          ) : (
            <div className="flex justify-center">{content}</div>
          )}
        </td>
      ))}

      {actions !== undefined && (
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-1">
            {actions}
          </div>
        </td>
      )}
    </tr>
  );
};

export default EmployeeRow;