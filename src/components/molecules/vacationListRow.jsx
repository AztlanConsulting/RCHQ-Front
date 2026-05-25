import Button from "../atoms/button";
import {
    formatDate,
    getSafeText,
    getStatusClassName,
} from "../../utils/vacationRequests";

const PENDING_STATUS = 0;

const VacationListRow = ({
    request,
    view,
    onViewDetail,
}) => {
    const isFutureView = view === "future";
    const isPending = request.status === PENDING_STATUS;
    const canEdit = isFutureView && isPending;
    const canDelete = isFutureView;
    const description = getSafeText(request.description ?? request.feedback);

    return (
        <tr className="border-b border-gray-200 last:border-b-0">
            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                {formatDate(request.startDate)}
            </td>

            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                {formatDate(request.endDate)}
            </td>

            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                {request.usedDays ?? "-"}
            </td>

            <td className="px-4 py-3 text-center">
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                        request.status,
                    )}`}
                >
                    {request.statusLabel || "—"}
                </span>
            </td>

            <td className="max-w-[280px] px-4 py-3 text-center text-sm font-semibold text-gray-600">
                <span className="line-clamp-2">
                    {description}
                </span>
            </td>

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

                    {canEdit && (
                        <Button
                            title="Modificar vacación"
                            onClick={() => {}}
                            bgColor="bg-transparent"
                            hoverColor="hover:bg-gray-100"
                            activeColor="active:bg-gray-200"
                            width="w-10"
                            height="h-10"
                            className="rounded-full"
                        >
                            <img
                                src="/lightEdit.svg"
                                alt="Modificar vacación"
                                className="h-5 w-5"
                            />
                        </Button>
                    )}

                    {canDelete && (
                        <Button
                            title="Borrar vacación"
                            onClick={() => {}}
                            bgColor="bg-transparent"
                            hoverColor="hover:bg-gray-100"
                            activeColor="active:bg-gray-200"
                            width="w-10"
                            height="h-10"
                            className="rounded-full"
                        >
                            <img
                                src="/trash.svg"
                                alt="Borrar vacación"
                                className="h-5 w-5"
                            />
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default VacationListRow;
