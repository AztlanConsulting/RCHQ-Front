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
                        <img
                            src="/eyeMark.svg"
                            alt="Ver detalle"
                            className="h-5 w-5"
                        />
                    </Button>

                    {view === "pending" && (
                        <>
                            <Button
                                title="Aprobar solicitud"
                                bgColor="bg-transparent"
                                hoverColor="hover:bg-gray-100"
                                activeColor="active:bg-gray-200"
                                width="w-10"
                                height="h-10"
                                className="rounded-full"
                            >
                                <img
                                    src="/checkMark.svg"
                                    alt="Aprobar solicitud"
                                    className="h-5 w-5"
                                />
                            </Button>

                            <Button
                                title="Rechazar solicitud"
                                bgColor="bg-transparent"
                                hoverColor="hover:bg-gray-100"
                                activeColor="active:bg-gray-200"
                                width="w-10"
                                height="h-10"
                                className="rounded-full"
                            >
                                <img
                                    src="/crossMark.svg"
                                    alt="Rechazar solicitud"
                                    className="h-5 w-5"
                                />
                            </Button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default VacationRequestRow;
