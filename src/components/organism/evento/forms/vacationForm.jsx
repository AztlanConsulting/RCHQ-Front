import { useMemo, useState } from "react";
import { getCalendarViewerRole } from "../../../../services/calendarService";
import { formatDateMx } from "../../../../utils/dates";
import Alert from "../../../atoms/alerts";
import SmallButton from "../../../atoms/smallButton";
import DateField from "../../../atoms/dateField";
import FormErrorText from "../../../atoms/formErrorText";
import TimeZoneSaveNotice from "../../../atoms/timeZoneSaveNotice";
import EmployeeSelectOption from "../../../molecules/employeeSelectOption";
import SingleSelectDropdown from "../../../molecules/singleSelectDropdown";
import { useVacationForm } from "../../../../hooks/pages/useVacationForm";
import {
    getVacationDateRange,
    getVacationEndDateMin,
} from "../../../../utils/vacationDateRange";
import {
    buildDateRuleFilter,
    parseDateOnly,
} from "../../../../utils/dateRules";

const VacationForm = (props) => {
    const {
        form,
        errors,
        serverError,
        employeeOptions,
        isLoadingOptions,
        isSubmitting,
        remainingInfo,
        isLoadingRemaining,
        dateRules,
        setField,
        setServerError,
        handleSubmit,
    } = useVacationForm(props);

    const [openDropdown, setOpenDropdown] = useState(null);

    const viewerRole = getCalendarViewerRole();
    const timeZoneSaveNotice = props.canSwitchCalendarTimeZone
        ? "Las vacaciones se guardan con base en horario central de México porque se contabilizan contra días laborales y días libres mexicanos."
        : "";
    const { minDate: vacationDateMin, maxDate: vacationDateMax } =
        getVacationDateRange();
    const ruleMinDate = parseDateOnly(dateRules?.minDate) ?? vacationDateMin;
    const ruleMaxDate = parseDateOnly(dateRules?.maxDate) ?? vacationDateMax;
    const vacationEndDateMin = getVacationEndDateMin(
        form.startDate,
        ruleMinDate,
        ruleMaxDate,
    );
    const dateRuleFilter = useMemo(
        () => buildDateRuleFilter(dateRules),
        [dateRules],
    );

    return (
        <>
            {viewerRole === "Coordinador" ? (
                <SingleSelectDropdown
                    id="vacation-employee"
                    label="Empleado"
                    placeholder={
                        isLoadingOptions
                            ? "Cargando empleados ..."
                            : "Selecciona el empleado ..."
                    }
                    value={form.employeeId}
                    options={employeeOptions}
                    isOpen={openDropdown === "employee"}
                    disabled={isLoadingOptions}
                    onToggle={() =>
                        setOpenDropdown((current) =>
                            current === "employee" ? null : "employee",
                        )
                    }
                    onClose={() => setOpenDropdown(null)}
                    onChange={(value) => {
                        setField("employeeId", value);
                        setOpenDropdown(null);
                    }}
                    renderOption={(option) => (
                        <EmployeeSelectOption
                            option={option}
                            isSelected={false}
                        />
                    )}
                    renderSelected={(option) => (
                        <EmployeeSelectOption option={option} isSelected />
                    )}
                />
            ) : null}

            {errors.employeeId && (
                <FormErrorText>{errors.employeeId}</FormErrorText>
            )}

            {form.employeeId ? (
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    {isLoadingRemaining ? (
                        "Consultando días disponibles..."
                    ) : remainingInfo ? (
                        <>
                            <p>
                                Días disponibles:{" "}
                                <span className="font-bold">
                                    {remainingInfo.remainingVacations}
                                </span>
                            </p>
                            <p className="text-xs text-slate-500">
                                Periodo actual:{" "}
                                {formatDateMx(remainingInfo.startDate, "-")} a{" "}
                                {formatDateMx(remainingInfo.endDate, "-")}
                            </p>
                        </>
                    ) : (
                        "No se pudieron consultar los días disponibles."
                    )}
                </div>
            ) : null}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                    <DateField
                        label="Fecha de inicio"
                        labelColor="text-[#374151]"
                        value={form.startDate}
                        placeholder="dd / mm / yyyy"
                        minDate={ruleMinDate}
                        maxDate={ruleMaxDate}
                        filterDate={dateRuleFilter}
                        popupSize="compact"
                        popupStrategy="fixed"
                        onChange={(e) => setField("startDate", e.target.value)}
                    />

                    {errors.startDate && (
                        <FormErrorText>{errors.startDate}</FormErrorText>
                    )}
                </div>

                <div className="min-w-0">
                    <DateField
                        label="Fecha de fin"
                        labelColor="text-[#374151]"
                        value={form.endDate}
                        placeholder="dd / mm / yyyy"
                        minDate={vacationEndDateMin}
                        maxDate={ruleMaxDate}
                        filterDate={dateRuleFilter}
                        popupAlign="right"
                        popupSize="compact"
                        popupStrategy="fixed"
                        onChange={(e) => setField("endDate", e.target.value)}
                    />

                    {errors.endDate && (
                        <FormErrorText>{errors.endDate}</FormErrorText>
                    )}
                </div>
            </div>

            <TimeZoneSaveNotice>{timeZoneSaveNotice}</TimeZoneSaveNotice>

            {viewerRole === "Coordinador" ? (
                <p className="mb-10 mt-2 text-xs text-slate-400">
                    Las vacaciones registradas por coordinación quedarán
                    aprobadas automáticamente.
                </p>
            ) : null}

            {serverError && (
                <div className="mb-5">
                    <Alert
                        type="error"
                        message={serverError}
                        onClose={() => setServerError("")}
                    />
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SmallButton
                    text={isSubmitting ? "Registrando..." : "Confirmar"}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoadingOptions || isLoadingRemaining}
                />
            </div>
        </>
    );
};

export default VacationForm;
