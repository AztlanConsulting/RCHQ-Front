import Button from "../../../atoms/button";
import DateField from "../../../atoms/dateField";
import Type from "../../../atoms/type";

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
    return (
        <div key="vacation-edit" className="px-2 text-left sm:px-3">
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

                {/* Extra top offset so picker popups aren’t clipped by scrollable modal */}
                <div className="col-span-1 mt-8 grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2 sm:mt-10">
                    <DateField
                        label="Fecha de inicio"
                        name="startDate"
                        value={vacationForm?.startDate ?? ""}
                        onChange={(editEvent) =>
                            onVacationFieldChange?.(
                                "startDate",
                                editEvent.target.value,
                            )
                        }
                        labelColor="text-[#121212]"
                        popupAlign="left"
                        popupPlacement="top"
                        popupSize="compact"
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
                        minDate={
                            vacationForm?.startDate
                                ? new Date(`${vacationForm.startDate}T00:00:00`)
                                : undefined
                        }
                        labelColor="text-[#121212]"
                        popupAlign="right"
                        popupPlacement="top"
                        popupSize="compact"
                    />
                </div>
            </div>

            {vacationEditError ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {vacationEditError}
                </p>
            ) : null}

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-5">
                <Button
                    type="button"
                    text="Cancelar"
                    width="w-full sm:w-[10rem]"
                    height="h-11"
                    textSize="text-base"
                    bgColor="bg-white"
                    textColor="text-[#121212]"
                    hoverColor="hover:bg-slate-50"
                    activeColor="active:bg-slate-100"
                    className="border border-slate-200 shadow-md"
                    onClick={onCancelEdit}
                    disabled={isSaving}
                />
                <Button
                    type="button"
                    text="Guardar"
                    width="w-full sm:w-[10rem]"
                    height="h-11"
                    textSize="text-base"
                    bgColor="bg-[#1F3664]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#15284A]"
                    activeColor="active:bg-[#0E1B33]"
                    className="shadow-md"
                    onClick={onSubmitEdit}
                    disabled={isSaving}
                />
            </div>
        </div>
    );
};

export default VacationEditForm;
