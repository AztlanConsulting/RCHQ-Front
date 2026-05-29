import Alert from "../../../atoms/alerts";
import SmallButton from "../../../atoms/smallButton";
import CheckboxField from "../../../atoms/checkboxField";
import DateField from "../../../atoms/dateField";
import EmployeeSearchSelect from "../../../atoms/employeeSearchSelect";
import ErrorText from "../../../atoms/errorText";
import SelectField from "../../../atoms/selectField";
import TimeField from "../../../atoms/timeField";
import TimeZoneSaveNotice from "../../../atoms/timeZoneSaveNotice";
import OverlapModal from "../../overlapModal";

import { usePersonalForm } from "../../../../hooks/pages/usePersonalForm";
import {
    getPersonalEndTimeMinTime,
    getPersonalTimeZoneSaveNotice,
} from "../../../../utils/schema/evento/personalEventRules";

const PersonalForm = (props) => {
    const {
        form,
        errors,
        serverError,
        eventTypes,
        employees,
        selectedEmployees,
        isSubmitting,
        isCoordinator,
        overlapState,
        showEndDateField,
        setField,
        setServerError,
        searchEmployees,
        handleSelectEmployee,
        handleRemoveEmployee,
        handleSubmit,
        handleForceOverlap,
        handleCancelOverlap,
    } = usePersonalForm(props);

    const isTimeVisible = !form.allDay;
    const timeZoneSaveNotice = getPersonalTimeZoneSaveNotice({
        allDay: form.allDay,
        calendarTimeZoneMode: props.calendarTimeZoneMode,
        canSwitchCalendarTimeZone: props.canSwitchCalendarTimeZone,
    });
    const descriptionLength = String(form.description ?? "").length;

    const today = new Date();
    const personalDateMin = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const personalDateMax = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: showEndDateField
                            ? "minmax(0, 1fr) minmax(0, 1fr)"
                            : "minmax(0, 1fr)",
                        gap: "8px",
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <DateField
                            label="Fecha"
                            labelColor="text-[#374151]"
                            value={form.date}
                            placeholder="dd / mm / yyyy"
                            onChange={(e) => setField("date", e.target.value)}
                            minDate={personalDateMin}
                            maxDate={personalDateMax}
                            error={!!errors.date}
                        />
                        {errors.date && <ErrorText>{errors.date}</ErrorText>}
                    </div>

                    {showEndDateField && (
                        <div style={{ minWidth: 0 }}>
                            <DateField
                                label="Fecha final"
                                labelColor="text-[#374151]"
                                value={form.endDate}
                                placeholder="dd / mm / yyyy"
                                onChange={(e) =>
                                    setField("endDate", e.target.value)
                                }
                                minDate={form.date ? new Date(`${form.date}T12:00:00`) : personalDateMin}
                                maxDate={personalDateMax}
                                error={!!errors.endDate}
                            />
                            {errors.endDate && (
                                <ErrorText>{errors.endDate}</ErrorText>
                            )}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        maxHeight: isTimeVisible ? "150px" : "0px",
                        overflow: "hidden",
                        opacity: isTimeVisible ? 1 : 0,
                        marginTop: isTimeVisible ? "0px" : "-8px",
                        transition:
                            "max-height 300ms ease, margin-top 300ms ease, opacity 250ms ease",
                    }}
                >
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                            <TimeField
                                value={form.startTime}
                                onChange={(value) => setField("startTime", value)}
                                placeholder="Inicio"
                                error={errors.startTime}
                                hideErrorText
                                disabled={form.allDay}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <TimeField
                                value={form.endTime}
                                onChange={(value) => setField("endTime", value)}
                                placeholder="Fin"
                                minTime={getPersonalEndTimeMinTime(form)}
                                error={errors.endTime}
                                hideErrorText
                                disabled={form.allDay}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                            {errors.startTime && <ErrorText>{errors.startTime}</ErrorText>}
                        </div>
                        <div style={{ flex: 1 }}>
                            {errors.endTime && <ErrorText>{errors.endTime}</ErrorText>}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        paddingTop: "2px",
                        paddingBottom: "12px",
                    }}
                >
                    <CheckboxField
                        id="allDay-personal"
                        label="Todo el día"
                        checked={form.allDay}
                        onChange={(value) => setField("allDay", value)}
                    />
                </div>

                <TimeZoneSaveNotice>{timeZoneSaveNotice}</TimeZoneSaveNotice>
            </div>

            <SelectField
                placeholder="Selecciona tipo de evento ..."
                value={form.eventTypeId}
                setValue={(value) => setField("eventTypeId", value)}
                options={eventTypes}
                error={!!errors.eventTypeId}
            />

            {errors.eventTypeId && <ErrorText>{errors.eventTypeId}</ErrorText>}

            {isCoordinator && (
                <div>
                    <EmployeeSearchSelect
                        label="Agregar empleados"
                        placeholder="Buscar por nombre..."
                        employees={employees}
                        selected={selectedEmployees}
                        onSelect={handleSelectEmployee}
                        onRemove={handleRemoveEmployee}
                        onSearch={searchEmployees}
                        error={!!errors.employees}
                    />
                    {errors.employees && <ErrorText>{errors.employees}</ErrorText>}
                </div>
            )}

            <div className="flex w-full flex-col gap-1.5">
                <label className="text-sm font-bold text-[#374151]">
                    Descripción
                </label>

                <textarea
                    placeholder="Agregar descripción ..."
                    value={form.description}
                    onChange={(e) =>
                        setField(
                            "description",
                            e.target.value.replace(
                                /[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g,
                                "",
                            ),
                        )
                    }
                    maxLength={250}
                    rows={3}
                    className="w-full rounded-lg bg-neutral-50 px-4 py-3 text-sm font-medium text-[#222] placeholder-[#aaaaaa] border-0 resize-none outline-none"
                    style={{ boxShadow: errors.description ? "inset 0 0 0 2px #f87171, inset 0px 4px 4px #00000040" : "inset 0px 4px 4px #00000040" }}
                />

                <div className="mt-1 text-right text-xs font-medium text-slate-500">
                    {`${descriptionLength}/250`}
                </div>

                {errors.description && (
                    <ErrorText>{errors.description}</ErrorText>
                )}
            </div>

            {serverError && (
                <Alert
                    type="error"
                    message={serverError}
                    onClose={() => setServerError(null)}
                />
            )}

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "8px",
                }}
            >
                <SmallButton
                    text={isSubmitting ? "Registrando..." : "Confirmar"}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                />
            </div>

            <OverlapModal
                isOpen={overlapState.show}
                overlappedEmployees={overlapState.overlappedEmployees}
                onConfirm={handleForceOverlap}
                onCancel={handleCancelOverlap}
                isLoading={overlapState.isForcing}
                isCoordinator={isCoordinator}
            />
        </>
    );
};

export default PersonalForm;
