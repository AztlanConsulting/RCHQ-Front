import Alert from "../../atoms/alerts";
import SmallButton from "../../atoms/smallButton";
import CheckboxField from "../../atoms/checkboxField";
import DateField from "../../atoms/dateField";
import ErrorText from "../../atoms/errorText";
import Modal from "../../atoms/modal";
import SelectField from "../../atoms/selectField";
import TextField from "../../atoms/textField";
import TimeField from "../../atoms/timeField";
import OverlapModal from "../overlapModal";
import { useUpdateHouseEventForm } from "../../../hooks/pages/useUpdateHouseEventForm";
import { isMexicoTimeZone } from "../../../utils/timeZone";

const UpdateHouseEventModal = ({
    event,
    isOpen,
    onClose,
    onSuccess,
    calendarTimeZone,
}) => {
    const {
        form,
        errors,
        serverError,
        validationAlert,
        eventTypes,
        isSubmitting,
        overlapState,
        setField,
        setServerError,
        setValidationAlert,
        handleSubmit,
        handleForceOverlap,
        handleCancelOverlap,
        getTimeContainerStyle,
    } = useUpdateHouseEventForm({
        event,
        isOpen,
        onClose,
        onSuccess,
        calendarTimeZone,
    });

    const showTimeFields = !form.allDay;
    const showMexicoTimeZoneMessage = form.isFreeDay && !isMexicoTimeZone();
    const descriptionLength = String(form.description ?? "").length;

    const currentYear = new Date().getFullYear();
    const houseDateMin = new Date(currentYear, 0, 1);
    const houseDateMax = new Date(currentYear + 2, 11, 31);

    return (
        <>
            <Modal
                open={isOpen}
                onClose={onClose}
                grayBackground
                placement="center"
                scrollable
                className="w-full max-w-[560px] max-h-[calc(100vh-2rem)] rounded-xl p-6"
                backdropClassName="bg-black/40"
            >
                <div style={{ position: "relative" }}>
                    {validationAlert && (
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 30,
                        }}>
                            <Alert
                                type="error"
                                message={validationAlert}
                                onClose={() => setValidationAlert(null)}
                            />
                        </div>
                    )}

                    <div
                        key={
                            event?.houseEventId ??
                            event?.eventId ??
                            event?.id ??
                            "update"
                        }
                        className="flex flex-col gap-4 animate-[fadeSlideIn_220ms_ease-in-out]"
                    >
                    <h2 className="text-2xl font-bold text-[#121212]">
                        Modificar evento de casa
                    </h2>

                    <TextField
                        id="update-house-event-name"
                        value={form.name}
                        setValue={(value) => setField("name", value)}
                        placeholder="Evento de casa"
                        maxLength={70}
                        labelClassName="hidden"
                    />
                    {errors.name && <ErrorText>{errors.name}</ErrorText>}

                    <div className="flex flex-col gap-1">
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <DateField
                                    label="Fecha de inicio"
                                    labelColor="text-[#374151]"
                                    value={form.startDate}
                                    onChange={(e) =>
                                        setField("startDate", e.target.value)
                                    }
                                    placeholder="dd / mm / yyyy"
                                    minDate={houseDateMin}
                                    maxDate={houseDateMax}
                                    error={!!errors.startDate}
                                />
                            </div>
                            <div style={getTimeContainerStyle(showTimeFields)}>
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
                        <div className="grid grid-cols-[1fr_0.9fr] gap-x-2">
                            <div>
                                {errors.startDate && (
                                    <ErrorText>{errors.startDate}</ErrorText>
                                )}
                            </div>
                            <div>
                                {showTimeFields && errors.startTime && (
                                    <ErrorText>{errors.startTime}</ErrorText>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <DateField
                                    label="Fecha de fin"
                                    labelColor="text-[#374151]"
                                    value={form.endDate}
                                    onChange={(e) =>
                                        setField("endDate", e.target.value)
                                    }
                                    placeholder="dd / mm / yyyy"
                                    minDate={houseDateMin}
                                    maxDate={houseDateMax}
                                    error={!!errors.endDate}
                                />
                            </div>
                            <div style={getTimeContainerStyle(showTimeFields)}>
                                <TimeField
                                    value={form.endTime}
                                    onChange={(value) =>
                                        setField("endTime", value)
                                    }
                                    minTime={
                                        form.startDate === form.endDate
                                            ? form.startTime
                                            : undefined
                                    }
                                    placeholder="-- : --"
                                    error={errors.endTime}
                                    hideErrorText
                                    disabled={form.allDay}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-[1fr_0.9fr] gap-x-2">
                            <div>
                                {errors.endDate && (
                                    <ErrorText>{errors.endDate}</ErrorText>
                                )}
                            </div>
                            <div>
                                {showTimeFields && errors.endTime && (
                                    <ErrorText>{errors.endTime}</ErrorText>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-5 pb-1">
                        <CheckboxField
                            id="update-house-event-all-day"
                            label="Todo el día"
                            checked={form.allDay}
                            onChange={(value) => setField("allDay", value)}
                        />
                        <CheckboxField
                            id="update-house-event-free-day"
                            label="Día libre"
                            checked={form.isFreeDay}
                            onChange={(value) => setField("isFreeDay", value)}
                        />
                    </div>

                    {showMexicoTimeZoneMessage ? (
                        <p className="mx-auto mt-1 mb-3 max-w-[30rem] rounded-md bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
                            Los días libres se guardan a las 00:00 en horario
                            central de México porque afectan el cálculo de
                            vacaciones y ausencias.
                        </p>
                    ) : null}

                    <SelectField
                        value={form.eventTypeId}
                        setValue={(value) => setField("eventTypeId", value)}
                        options={eventTypes}
                        placeholder="General"
                        error={!!errors.eventTypeId}
                    />
                    {errors.eventTypeId && (
                        <ErrorText>{errors.eventTypeId}</ErrorText>
                    )}

                    <div className="flex w-full flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#374151]">
                            Descripción
                        </label>
                        <textarea
                            placeholder="Este es un evento de casa"
                            value={form.description}
                            onChange={(e) =>
                                setField("description", e.target.value)
                            }
                            maxLength={250}
                            rows={4}
                            className="min-h-[96px] w-full resize-none rounded-lg border-0 bg-neutral-50 px-4 py-3 text-sm font-medium text-[#222] outline-none placeholder-[#aaaaaa]"
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

                    <div className="flex justify-center gap-3 pt-1">
                        <SmallButton
                            text="Cancelar"
                            onClick={onClose}
                            disabled={isSubmitting}
                            cancel
                        />
                        <SmallButton
                            text={isSubmitting ? "Modificando..." : "Modificar"}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        />
                    </div>
                    </div>
                </div>
            </Modal>

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

export default UpdateHouseEventModal;
