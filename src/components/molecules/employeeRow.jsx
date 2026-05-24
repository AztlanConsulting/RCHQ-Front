import { useNavigate } from "react-router-dom";
import EmployeeAvatar from "../atoms/employeeAvatar";
import StatusBadge from "../atoms/statusBadge";
import showEyeIcon from "/showEye.svg";
import checkMarkIcon from "/add.svg";
import crossMarkIcon from "/close.svg";


const EmployeeRow = ({ employee, isBlacklistMode = false, onAddToBlacklist }) => {
  const navigate = useNavigate();

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <EmployeeAvatar
            picture={employee.picture}
            fullName={employee.fullName}
          />
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <p className="font-medium text-[#121212]">{employee.fullName}</p>
      </td>

      <td className="px-6 py-4 text-center">
        <p className="text-[#666666]">{employee.role ?? employee.roleName}</p>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <StatusBadge isActive={
            typeof employee.status === "string"
              ? employee.status === "Activo"
              : employee.status
          } />
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center h-full">
          {isBlacklistMode ? (
            employee.isBlacklisted ? (
              <span
                className="text-gray-400 flex items-center justify-center p-2"
                title="Ya está en lista negra"
              >
                <img
                  src={crossMarkIcon}
                  alt="En lista negra"
                  className="w-6 h-6"
                />
              </span>
            ) : (
              <button
                onClick={() => onAddToBlacklist(employee)}
                className="text-gray-500 hover:text-[#9b1c1c] transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-red-50"
                aria-label="Agregar a lista negra"
                title="Agregar a lista negra"
              >
                <img
                  src= {checkMarkIcon}
                  alt="Agregar"
                  className="w-6 h-6"
                />
              </button>
            )
          ) : (
            <button
              onClick={() => navigate(`/app/personal/ver/${employee.employeeId}`)}
              className="text-gray-600 hover:text-[#24375e] transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
              aria-label="Ver empleado"
              title="Ver detalles"
            >
              <img src={showEyeIcon} alt="Ver" className="w-5 h-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default EmployeeRow;