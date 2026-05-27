import Button from "../../../atoms/button";
import DateField from "../../../atoms/dateField";
import Type from "../../../atoms/type";
import {
    getVacationDateRange,
    getVacationEndDateMin,
} from "../../../../utils/vacationDateRange";

const VacationEditForm = ({
    title,
    event,
    vacationForm,
    vacationEditError = "",
    vacationRemainingInfo = null,
    isLoadingVacationRemaining = false,
    isSaving = false,
    onCancelEdit,
    onSubmitEdit,
    onVacationFieldChange,
    showEmployeeInfo = true,
}) => {
    const { minDate: vacationDateMin, maxDate: vacationDateMax } =
        getVacationDateRange();
    const vacationEndDateMin = getVacationEndDateMin(
        vacationForm?.startDate,
        vacationDateMin,
        vacationDateMax,
    );

    return (
        <div
            key="vacation-edit"
            className="overflow-visible px-2 text-left sm:px-3"
        >
            <Type
                variant="page-title"
                className="mb-5 text-[2rem] leading-none"
                as="h2"
            >
                {title}
            </Type>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {showEmployeeInfo ? (
                    <>
                        <div>
                            <Type
                                variant="metric-label"
                                className="mb-1.5 block font-bold text-[#121212]"
                            >
                                Nombre del trabajador
                            </Type>
                            <div className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                                {event.employeeName || "-"}
                            </div>
                        </div>

                        <div>
                            <Type
                                variant="metric-label"
                                className="mb-1.5 block font-bold text-[#121212]"
                            >
                                CURP
                            </Type>
                            <div className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                                {event.curp || "-"}
                            </div>
                        </div>
                    </>
                ) : null}

                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 sm:col-span-2">
                    {isLoadingVacationRemaining ? (
                        "Consultando días disponibles..."
                    ) : vacationRemainingInfo ? (
                        <>
                            <p>
                                Días disponibles:{" "}
                                <span className="font-bold">
                                    {vacationRemainingInfo.remainingVacations}
                                </span>
                            </p>
                            <p className="text-xs text-slate-500">
                                Periodo actual:{" "}
                                {String(vacationRemainingInfo.startDate).split("T")[0]} a{" "}
                                {String(vacationRemainingInfo.endDate).split("T")[0]}
                            </p>
                        </>
                    ) : (
                        "No se pudieron consultar los días disponibles."
                    )}
                </div>

                <DateField
                    label="Fecha de inicio"
                    name="startDate"
                    value={vacationForm?.startDate ?? ""}
                    minDate={vacationDateMin}
                    maxDate={vacationDateMax}
                    onChange={(editEvent) =>
                        onVacationFieldChange?.(
                            "startDate",
                            editEvent.target.value,
                        )
                    }
                    labelColor="text-[#121212]"
                    popupAlign="left"
                    popupPlacement="bottom"
                    popupSize="compact"
                    popupStrategy="fixed"
                />

                <DateField
                    label="Fecha de fin"
                    name="endDate"
                    value={vacationForm?.endDate ?? ""}
                    onChange={(editEvent) =>
                        onVacationFieldChange?.(
                            "endDate",
                            editEvent.target.value,
                        )
                    }
                    minDate={vacationEndDateMin}
                    maxDate={vacationDateMax}
                    labelColor="text-[#121212]"
                    popupAlign="right"
                    popupPlacement="bottom"
                    popupSize="compact"
                    popupStrategy="fixed"
                />
            </div>

            {vacationEditError ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {vacationEditError}
                </p>
            ) : null}

            <div className="mt-8 flex justify-center gap-3">
                <Button
                    type="button"
                    text="Cancelar"
                    width="w-auto"
                    height="h-[38px]"
                    textSize="text-sm"
                    fontWeight="font-bold"
                    bgColor="bg-white"
                    textColor="text-[#121212]"
                    hoverColor="hover:bg-slate-50"
                    activeColor="active:bg-slate-100"
                    className="px-5 border border-slate-200 shadow-md"
                    onClick={onCancelEdit}
                    disabled={isSaving}
                />
                <Button
                    type="button"
                    text="Guardar"
                    width="w-auto"
                    height="h-[38px]"
                    textSize="text-sm"
                    fontWeight="font-bold"
                    bgColor="bg-[#1F3664]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#15284A]"
                    activeColor="active:bg-[#0E1B33]"
                    className="px-5 shadow-md"
                    onClick={onSubmitEdit}
                    disabled={isSaving}
                />
            </div>
        </div>
    );
};

export default VacationEditForm;
