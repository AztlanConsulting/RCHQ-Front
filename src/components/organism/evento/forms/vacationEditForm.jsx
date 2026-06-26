import SmallButton from "../../../atoms/smallButton";
import DateField from "../../../atoms/dateField";
import { formatDateMx } from "../../../../utils/dates";
import Type from "../../../atoms/type";
import { isMexicoTimeZone } from "../../../../utils/timeZone";
import {
    getVacationDateRange,
    getVacationEndDateMin,
} from "../../../../utils/vacationDateRange";
import {
    buildDateRuleFilter,
    parseDateOnly,
} from "../../../../utils/dateRules";
import { useMemo } from "react";

const VacationEditForm = ({
    title,
    event,
    vacationForm,
    vacationEditError = "",
    vacationRemainingInfo = null,
    vacationDateRules = null,
    isLoadingVacationRemaining = false,
    isSaving = false,
    onCancelEdit,
    onSubmitEdit,
    onVacationFieldChange,
    showEmployeeInfo = true,
}) => {
    const showMexicoTimeZoneMessage = !isMexicoTimeZone();
    const { minDate: vacationDateMin, maxDate: vacationDateMax } =
        getVacationDateRange();
    const ruleMinDate = parseDateOnly(vacationDateRules?.minDate) ?? vacationDateMin;
    const ruleMaxDate = parseDateOnly(vacationDateRules?.maxDate) ?? vacationDateMax;
    const vacationEndDateMin = getVacationEndDateMin(
        vacationForm?.startDate,
        ruleMinDate,
        ruleMaxDate,
    );
    const dateRuleFilter = useMemo(
        () => buildDateRuleFilter(vacationDateRules),
        [vacationDateRules],
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
                            <Type
                                variant="body"
                                className="text-[1.05rem] leading-snug wrap-break-word"
                            >
                                {event.employeeName || "-"}
                            </Type>
                        </div>

                        <div>
                            <Type
                                variant="metric-label"
                                className="mb-1.5 block font-bold text-[#121212]"
                            >
                                CURP
                            </Type>
                            <Type
                                variant="body"
                                className="break-all text-[1.05rem] leading-snug sm:break-normal"
                            >
                                {event.curp || "-"}
                            </Type>
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
                                {formatDateMx(vacationRemainingInfo.startDate, "-")} a{" "}
                                {formatDateMx(vacationRemainingInfo.endDate, "-")}
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
                    minDate={ruleMinDate}
                    maxDate={ruleMaxDate}
                    filterDate={dateRuleFilter}
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
                    minDate={vacationEndDateMin}
                    maxDate={ruleMaxDate}
                    filterDate={dateRuleFilter}
                    labelColor="text-[#121212]"
                    popupAlign="right"
                    popupPlacement="top"
                    popupSize="compact"
                />
            </div>

            {showMexicoTimeZoneMessage ? (
                <p className="mx-auto mt-5 mb-1 max-w-[30rem] rounded-md bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
                    Las vacaciones se guardan con base en horario central de
                    México porque se contabilizan contra días laborales y días
                    libres mexicanos.
                </p>
            ) : null}

            {vacationEditError ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {vacationEditError}
                </p>
            ) : null}

            <div className="mt-8 flex justify-center gap-3">
                <SmallButton
                    type="button"
                    text="Cancelar"
                    onClick={onCancelEdit}
                    disabled={isSaving}
                    cancel
                />
                <SmallButton
                    type="button"
                    text="Guardar"
                    onClick={onSubmitEdit}
                    disabled={isSaving}
                />
            </div>
        </div>
    );
};

export default VacationEditForm;
