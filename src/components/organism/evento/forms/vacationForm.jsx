import { useState } from "react";
import { getCalendarViewerRole } from "../../../../services/calendarService";

import Alert from "../../../atoms/alerts";
import Button from "../../../atoms/button";
import DateField from "../../../atoms/dateField";
import FormErrorText from "../../../atoms/formErrorText";
import EmployeeSelectOption from "../../../molecules/employeeSelectOption";
import SingleSelectDropdown from "../../../molecules/singleSelectDropdown";
import { useVacationForm } from "../../../../hooks/pages/useVacationForm";
import { isMexicoTimeZone } from "../../../../utils/timeZone";

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
        setField,
        setServerError,
        handleSubmit,
    } = useVacationForm(props);

    const [openDropdown, setOpenDropdown] = useState(null);

    const viewerRole = getCalendarViewerRole();
    const showMexicoTimeZoneMessage = !isMexicoTimeZone();

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
                                {String(remainingInfo.startDate).split("T")[0]}{" "}
                                a {String(remainingInfo.endDate).split("T")[0]}
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
                        popupSize="compact"
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
                        popupAlign="right"
                        popupSize="compact"
                        onChange={(e) => setField("endDate", e.target.value)}
                    />

                    {errors.endDate && (
                        <FormErrorText>{errors.endDate}</FormErrorText>
                    )}
                </div>
            </div>

            {showMexicoTimeZoneMessage ? (
                <p className="mx-auto mt-1 mb-4 max-w-[30rem] rounded-md bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
                    Las vacaciones se guardan con base en horario de México
                    porque se contabilizan contra días laborales y días libres
                    mexicanos.
                </p>
            ) : null}

            {viewerRole === "Coordinador" ? (
                <p className="mb-5 text-xs text-slate-400">
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
                <Button
                    text={isSubmitting ? "Registrando..." : "Confirmar"}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoadingOptions}
                    bgColor="bg-[#1E3A5F]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#162d4a]"
                    activeColor="active:bg-[#0f1f33]"
                    width="w-auto"
                    height="h-[38px]"
                    textSize="text-sm"
                    fontWeight="font-semibold"
                    className="px-5"
                />
            </div>
        </>
    );
};

export default VacationForm;
