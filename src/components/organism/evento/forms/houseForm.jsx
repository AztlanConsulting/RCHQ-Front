import Alert from "../../../atoms/alerts";
import SmallButton from "../../../atoms/smallButton";
import CheckboxField from "../../../atoms/checkboxField";
import DateField from "../../../atoms/dateField";
import ErrorText from "../../../atoms/errorText";
import SelectField from "../../../atoms/selectField";
import TimeField from "../../../atoms/timeField";
import TimeZoneSaveNotice from "../../../atoms/timeZoneSaveNotice";
import OverlapModal from "../../overlapModal";

import { useHouseForm } from "../../../../hooks/pages/useHouseForm";

const CasaForm = (props) => {
    const {
        form,
        errors,
        serverError,
        eventTypes,
        isSubmitting,
        overlapState,
        setField,
        setServerError,
        handleSubmit,
        handleForceOverlap,
        handleCancelOverlap,
        getTimeContainerStyle,
    } = useHouseForm(props);

    const isTimeVisible = !form.allDay;
    const timeZoneSaveNotice = (() => {
        if (!props.canSwitchCalendarTimeZone) return "";
        if (form.isFreeDay) {
            return "Los días libres se guardan a las 00:00 en horario central de México porque afectan el cálculo de vacaciones y ausencias.";
        }
        if (props.calendarTimeZoneMode === "mexico") {
            return "Este evento se guardará con base en horario central de México.";
        }
        return "Este evento se guardará con base en tu horario local.";
    })();
    const descriptionLength = String(form.description ?? "").length;

    const currentYear = new Date().getFullYear();
    const houseDateMin = new Date(currentYear, 0, 1);
    const houseDateMax = new Date(currentYear + 2, 11, 31);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-end",
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <DateField
                                label="Fecha de inicio"
                                labelColor="text-[#374151]"
                                value={form.startDate}
                                placeholder="dd / mm / yyyy"
                                onChange={(e) =>
                                    setField("startDate", e.target.value)
                                }
                                minDate={houseDateMin}
                                maxDate={houseDateMax}
                                error={!!errors.startDate}
                            />
                        </div>

                        <div style={getTimeContainerStyle(isTimeVisible)}>
                            <TimeField
                                value={form.startTime}
                                onChange={(value) =>
                                    setField("startTime", value)
                                }
                                placeholder="-- : --"
                                error={errors.startTime}
                                hideErrorText
                                disabled={form.allDay}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                            {errors.startDate && (
                                <ErrorText>{errors.startDate}</ErrorText>
                            )}
                        </div>
                        {isTimeVisible && (
                            <div style={{ flex: 1 }}>
                                {errors.startTime && (
                                    <ErrorText>{errors.startTime}</ErrorText>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-end",
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <DateField
                                label="Fecha de fin"
                                labelColor="text-[#374151]"
                                value={form.endDate}
                                placeholder="dd / mm / yyyy"
                                onChange={(e) =>
                                    setField("endDate", e.target.value)
                                }
                                minDate={houseDateMin}
                                maxDate={houseDateMax}
                                error={!!errors.endDate}
                            />
                        </div>

                        <div style={getTimeContainerStyle(isTimeVisible)}>
                            <TimeField
                                value={form.endTime}
                                onChange={(value) => setField("endTime", value)}
                                placeholder="-- : --"
                                minTime={
                                    form.startDate === form.endDate
                                        ? form.startTime
                                        : undefined
                                }
                                error={errors.endTime}
                                hideErrorText
                                disabled={form.allDay}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                            {errors.endDate && (
                                <ErrorText>{errors.endDate}</ErrorText>
                            )}
                        </div>
                        {isTimeVisible && (
                            <div style={{ flex: 1 }}>
                                {errors.endTime && (
                                    <ErrorText>{errors.endTime}</ErrorText>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        paddingTop: "2px",
                        paddingBottom: "12px",
                    }}
                >
                    <CheckboxField
                        id="allDay"
                        label="Todo el día"
                        checked={form.allDay}
                        onChange={(value) => setField("allDay", value)}
                    />

                    <CheckboxField
                        id="isFreeDay"
                        label="Día libre"
                        checked={form.isFreeDay}
                        onChange={(value) => setField("isFreeDay", value)}
                    />
                </div>

                <TimeZoneSaveNotice>{timeZoneSaveNotice}</TimeZoneSaveNotice>
            </div>

            <SelectField
                label="Tipo de evento"
                placeholder="Selecciona tipo de evento ..."
                value={form.eventTypeId}
                setValue={(value) => setField("eventTypeId", value)}
                options={eventTypes}
                error={!!errors.eventTypeId}
            />

            {errors.eventTypeId && <ErrorText>{errors.eventTypeId}</ErrorText>}

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
                    style={{
                        boxShadow: errors.description
                            ? "inset 0 0 0 2px #f87171, inset 0px 4px 4px #00000040"
                            : "inset 0px 4px 4px #00000040",
                    }}
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

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SmallButton
                    text={isSubmitting ? "Registrando..." : "Confirmar"}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                />
            </div>

            <OverlapModal
                isOpen={overlapState.show}
                collisions={overlapState.collisions}
                onConfirm={handleForceOverlap}
                onCancel={handleCancelOverlap}
                isLoading={overlapState.isForcing}
            />
        </>
    );
};

export default CasaForm;
