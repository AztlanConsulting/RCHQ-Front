import { useNavigate } from "react-router-dom";
import EmployeeAvatar from "../Atoms/EmployeeAvatar";
import StatusBadge from "../Atoms/StatusBadge";
import showEyeIcon from "/showEye.svg";

const EmployeeRow = ({ employee }) => {
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
                <p className="font-medium text-[#121212]">
                    {employee.fullName}
                </p>
            </td>

            <td className="px-6 py-4 text-center">
                <p className="text-[#666666]">{employee.role}</p>
            </td>

            <td className="px-6 py-4 text-center">
                <div className="flex justify-center">
                    <StatusBadge isActive={employee.status} />
                </div>
            </td>

            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center h-full">
                    <button
                        onClick={() =>
                            navigate(`/app/personal/ver/${employee.employeeId}`)
                        }
                        className="text-gray-600 hover:text-[#24375e] transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                        aria-label="Ver empleado"
                        title="Ver detalles"
                    >
                        <img src={showEyeIcon} alt="Ver" className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default EmployeeRow;
