import EmployeeAvatar from "../atoms/employeeAvatar";
import Button from "../atoms/button";
import {
    formatDate,
    getSafeText,
    getStatusClassName,
} from "../../utils/vacationRequests";

const VacationRequestRow = ({ request, view, onViewDetail }) => {
    const employee = request.employee || {};
    const fullName = getSafeText(employee.fullName);

    return (
        <tr className="border-b border-gray-200 last:border-b-0">
            <td className="px-4 py-3">
                <EmployeeAvatar
                    picture={employee.picture}
                    fullName={fullName}
                    className="mx-auto h-12 w-12"
                />
            </td>

            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                {fullName}
            </td>

            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                {getSafeText(employee.curp)}
            </td>

            {/* <td className="hidden px-4 py-3 text-center text-sm font-semibold text-gray-600 lg:table-cell">
                {getSafeText(employee.house?.name)}
            </td> */}

            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                {formatDate(request.startDate)}
            </td>

            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                {formatDate(request.endDate)}
            </td>

            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                {request.usedDays ?? "-"}
            </td>

            {view === "reviewed" && (
                <td className="px-4 py-3 text-center">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                            request.status,
                        )}`}
                    >
                        {request.statusLabel || "—"}
                    </span>
                </td>
            )}

            <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                    <Button
                        title="Ver detalle"
                        onClick={() => onViewDetail(request)}
                        bgColor="bg-transparent"
                        hoverColor="hover:bg-gray-100"
                        activeColor="active:bg-gray-200"
                        width="w-10"
                        height="h-10"
                        className="rounded-full"
                    >
                        <span className="text-xl font-bold text-gray-600">ojo</span>
                    </Button>

                    {view === "pending" && (
                        <>
                            <Button
                                title="Aprobar solicitud"
                                disabled
                                bgColor="bg-transparent"
                                hoverColor="hover:bg-gray-100"
                                activeColor="active:bg-gray-200"
                                width="w-10"
                                height="h-10"
                                className="rounded-full"
                            >
                                <span className="text-2xl font-bold text-gray-400">✓</span>
                            </Button>

                            <Button
                                title="Rechazar solicitud"
                                disabled
                                bgColor="bg-transparent"
                                hoverColor="hover:bg-gray-100"
                                activeColor="active:bg-gray-200"
                                width="w-10"
                                height="h-10"
                                className="rounded-full"
                            >
                                <span className="text-2xl font-bold text-gray-400">×</span>
                            </Button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default VacationRequestRow;
