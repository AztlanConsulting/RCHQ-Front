import Button from "../../atoms/button";
import Type from "../../atoms/type";
import Dates from "@/utils/helpers/dates.helpers";

const VacationDetail = ({
    event,
    onClose,
    onEdit,
    onDelete,
    onApprove,
    onReject,
}) => {
    const isPast = Dates.isPastDate(event.start);
    const status = Number(event.status);

    const isPending = status === 0;
    const isApproved = status === 1;
    const isRejected = status === 2;

    const title = isPending
        ? "Solicitud de Vacaciones"
        : isRejected
            ? "Vacaciones Rechazadas"
            : "Vacaciones";

    const statusLabel = isApproved
        ? "Aprobadas"
        : isRejected
            ? "Rechazadas"
            : "En espera";

    const feedback = event.feedback || event.vacationFeedback || "";
    const shouldShowFeedback = Boolean(feedback);

    return (
        <div className="px-1 text-left sm:px-2">
            <Type
                variant="page-title"
                className="mb-5 text-[2rem] leading-none"
                as="h2"
            >
                {title}
            </Type>
            <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Nombre del trabajador
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.employeeName || "—"}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        CURP
                    </Type>
                    <Type
                        variant="body"
                        className="break-all text-[1.05rem] leading-snug sm:break-normal"
                    >
                        {event.curp || "—"}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de Inicio:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {Dates.formatEventDate(event.readableStart || event.startDate || event.start)}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de final:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {Dates.formatEventDate(event.readableEnd || event.endDate || event.end)}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Días totales:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.totalDays || "-"}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Días hábiles:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.usedDays ?? "-"}
                    </Type>
                </div>
                <div className="sm:col-span-2">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Estado:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {statusLabel}
                    </Type>
                </div>
                {shouldShowFeedback ? (
                    <div className="sm:col-span-2">
                        <Type
                            variant="metric-label"
                            className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                        >
                            Retroalimentación:
                        </Type>
                        <Type
                            variant="body"
                            className="text-[1.05rem] leading-snug"
                        >
                            {feedback}
                        </Type>
                    </div>
                ) : null}
            </div>

            {isPast ? (
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
                    <Button
                        type="button"
                        text="Cerrar"
                        width="w-full sm:w-[7.2rem]"
                        height="h-8"
                        textSize="text-[0.95rem]"
                        bgColor="bg-[#1F3664]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#15284A]"
                        activeColor="active:bg-[#0E1B33]"
                        className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                        onClick={onClose}
                    />
                </div>
            ) : null}

            {!isPast ? (
                <div className="mt-6 flex flex-row items-center gap-3 sm:justify-center sm:gap-8">
                    <Button
                        type="button"
                        text="Eliminar"
                        width="w-1/2 sm:w-[7.2rem]"
                        height="h-8"
                        textSize="text-[0.95rem]"
                        bgColor="bg-[#A20000]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#870000]"
                        activeColor="active:bg-[#6B0000]"
                        className="rounded-md shadow-[0_4px_10px_rgba(166,0,0,0.32)]"
                        onClick={onDelete}
                    />
                    <Button
                        type="button"
                        text="Editar"
                        width="w-1/2 sm:w-[7.2rem]"
                        height="h-8"
                        textSize="text-[0.95rem]"
                        bgColor="bg-[#1F3664]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#15284A]"
                        activeColor="active:bg-[#0E1B33]"
                        className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                        onClick={onEdit}
                    />
                </div>
            ) : null}

            {!isPast && event.status == 0 ? (
                <div>
                    <div className="mt-4 border border-b border-[#EAEAEA]"></div>

                    <div className="mt-4 flex flex-row items-center gap-3 sm:justify-center sm:gap-8">
                        <Button
                            type="button"
                            text="Aprobar"
                            width="w-1/2 sm:w-[7.2rem]"
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#1F3664]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#15284A]"
                            activeColor="active:bg-[#0E1B33]"
                            className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                            onClick={onApprove}
                        />
                        <Button
                            type="button"
                            text="Rechazar"
                            width="w-1/2 sm:w-[7.2rem]"
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#1F3664]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#15284A]"
                            activeColor="active:bg-[#0E1B33]"
                            className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                            onClick={onReject}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default VacationDetail;
