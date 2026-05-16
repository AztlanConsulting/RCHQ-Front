import Alert from "../../../atoms/alerts";
import Button from "../../../atoms/button";
import DateField from "../../../atoms/dateField";
import SelectField from "../../../atoms/selectField";
import TimeField from "../../../atoms/timeField";
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
                        />

                        {errors.startDate && (
                            <ErrorText>{errors.startDate}</ErrorText>
                        )}
                    </div>

                    <div style={getTimeContainerStyle(isTimeVisible)}>
                        <TimeField
                            value={form.startTime}
                            onChange={(value) => setField("startTime", value)}
                            placeholder="-- : --"
                            error={errors.startTime}
                            disabled={form.allDay}
                        />
                    </div>
                </div>

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
                        />

                        {errors.endDate && (
                            <ErrorText>{errors.endDate}</ErrorText>
                        )}
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
                            disabled={form.allDay}
                        />
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
            </div>

            <SelectField
                placeholder="Selecciona tipo de evento ..."
                value={form.eventTypeId}
                setValue={(value) => setField("eventTypeId", value)}
                options={eventTypes}
            />

            {errors.eventTypeId && <ErrorText>{errors.eventTypeId}</ErrorText>}

            <div className="flex w-full flex-col gap-1.5">
                <label className="text-sm font-bold text-[#374151]">
                    Descripción
                </label>

                <textarea
                    placeholder="Agregar descripción ..."
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g, ""))}
                    maxLength={250}
                    rows={3}
                    className="w-full rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040] text-sm font-medium text-[#222] placeholder-[#aaaaaa] border-0 outline-none resize-none"
                />

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
                <Button
                    text={isSubmitting ? "Registrando..." : "Confirmar"}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
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

const ErrorText = ({ children }) => (
    <p
        style={{
            margin: "4px 0 0",
            fontSize: "12px",
            color: "#dc2626",
        }}
    >
        {children}
    </p>
);

const CheckboxField = ({ id, label, checked, onChange }) => (
    <label
        htmlFor={id}
        style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#111827",
            cursor: "pointer",
            userSelect: "none",
        }}
    >
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            style={{
                width: "15px",
                height: "15px",
                accentColor: "#1E3A5F",
                cursor: "pointer",
                flexShrink: 0,
            }}
        />

        {label}
    </label>
);

export default CasaForm;
