import Alert from "../../atoms/alerts";
import SmallButton from "../../atoms/smallButton";
import CheckboxField from "../../atoms/checkboxField";
import DateField from "../../atoms/dateField";
import EmployeeSearchSelect from "../../atoms/employeeSearchSelect";
import ErrorText from "../../atoms/errorText";
import Modal from "../../atoms/modal";
import SelectField from "../../atoms/selectField";
import TextField from "../../atoms/textField";
import TimeField from "../../atoms/timeField";
import OverlapModal from "../overlapModal";
import { useUpdatePersonalEventForm } from "../../../hooks/pages/useUpdatePersonalEventForm";

const UpdatePersonalEventModal = ({ event, isOpen, onClose, onSuccess }) => {
    const {
        form,
        errors,
        serverError,
        validationAlert,
        eventTypes,
        employees,
        selectedEmployees,
        isSubmitting,
        isCoordinator,
        overlapState,
        setField,
        setServerError,
        setValidationAlert,
        searchEmployees,
        handleSelectEmployee,
        handleRemoveEmployee,
        handleSubmit,
        handleForceOverlap,
        handleCancelOverlap,
    } = useUpdatePersonalEventForm({ event, isOpen, onClose, onSuccess });

    const showTimeFields = !form.allDay;
    const descriptionLength = String(form.description ?? "").length;

    const today = new Date();
    const personalDateMin = today;
    const personalDateMax = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

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
                        key={event?.eventId ?? event?.id ?? "update-personal"}
                        className="flex flex-col gap-4 animate-[fadeSlideIn_220ms_ease-in-out]"
                    >
                    <h2 className="text-2xl font-bold text-[#121212]">
                        Modificar evento personal
                    </h2>

                    <TextField
                        id="update-personal-event-name"
                        value={form.name}
                        setValue={(value) => setField("name", value)}
                        placeholder="Evento personal"
                        maxLength={120}
                        labelClassName="hidden"
                    />
                    {errors.name && <ErrorText>{errors.name}</ErrorText>}

                    <div className="flex flex-col gap-2">
                        <div>
                            <DateField
                                label="Fecha"
                                labelColor="text-[#374151]"
                                value={form.date}
                                onChange={(e) =>
                                    setField("date", e.target.value)
                                }
                                placeholder="dd / mm / yyyy"
                                minDate={personalDateMin}
                                maxDate={personalDateMax}
                                error={!!errors.date}
                            />
                            {errors.date && (
                                <ErrorText>{errors.date}</ErrorText>
                            )}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                maxHeight: showTimeFields ? "150px" : "0px",
                                overflow: "hidden",
                                opacity: showTimeFields ? 1 : 0,
                                marginTop: showTimeFields ? "0px" : "-8px",
                                transition:
                                    "max-height 300ms ease, margin-top 300ms ease, opacity 250ms ease",
                            }}
                        >
                            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                                <div style={{ flex: 1 }}>
                                    <TimeField
                                        value={form.startTime}
                                        onChange={(value) =>
                                            setField("startTime", value)
                                        }
                                        placeholder="Inicio"
                                        error={errors.startTime}
                                        hideErrorText
                                        disabled={form.allDay}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <TimeField
                                        value={form.endTime}
                                        onChange={(value) =>
                                            setField("endTime", value)
                                        }
                                        minTime={form.startTime}
                                        placeholder="Fin"
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
                    </div>

                    <div className="flex gap-5 pb-1">
                        <CheckboxField
                            id="update-personal-event-all-day"
                            label="Todo el día"
                            checked={form.allDay}
                            onChange={(value) => setField("allDay", value)}
                        />
                    </div>

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
                overlappedEmployees={overlapState.overlappedEmployees}
                onConfirm={handleForceOverlap}
                onCancel={handleCancelOverlap}
                isLoading={overlapState.isForcing}
                isCoordinator={isCoordinator}
            />
        </>
    );
};

export default UpdatePersonalEventModal;
