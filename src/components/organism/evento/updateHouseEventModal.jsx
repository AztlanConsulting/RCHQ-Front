import Alert from "../../atoms/alerts";
import Button from "../../atoms/button";
import CheckboxField from "../../atoms/checkboxField";
import DateField from "../../atoms/dateField";
import ErrorText from "../../atoms/errorText";
import Modal from "../../atoms/modal";
import SelectField from "../../atoms/selectField";
import TextField from "../../atoms/textField";
import TimeField from "../../atoms/timeField";
import OverlapModal from "../overlapModal";
import { useUpdateHouseEventForm } from "../../../hooks/pages/useUpdateHouseEventForm";

const UpdateHouseEventModal = ({ event, isOpen, onClose, onSuccess }) => {
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
    } = useUpdateHouseEventForm({ event, isOpen, onClose, onSuccess });

    const showTimeFields = !form.allDay;

    return (
        <>
            <Modal
                open={isOpen}
                onClose={onClose}
                grayBackground
                placement="center"
                className="w-full max-w-[560px] rounded-xl p-6"
                backdropClassName="bg-black/40"
            >
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
                                />
                            </div>
                            <div style={getTimeContainerStyle(showTimeFields)}>
                                <TimeField
                                    value={form.startTime}
                                    onChange={(value) =>
                                        setField("startTime", value)
                                    }
                                    placeholder="-- : --"
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

                    <SelectField
                        value={form.eventTypeId}
                        setValue={(value) => setField("eventTypeId", value)}
                        options={eventTypes}
                        placeholder="General"
                    />
                    {errors.eventTypeId && (
                        <ErrorText>{errors.eventTypeId}</ErrorText>
                    )}

                    <textarea
                        placeholder="Este es un evento de casa"
                        value={form.description}
                        onChange={(e) =>
                            setField("description", e.target.value)
                        }
                        maxLength={250}
                        rows={4}
                        className="min-h-[96px] w-full resize-none rounded-lg border-0 bg-neutral-50 px-4 py-3 text-sm font-medium text-[#222] shadow-[inset_0px_4px_4px_#00000040] outline-none placeholder-[#aaaaaa]"
                    />
                    {errors.description && (
                        <ErrorText>{errors.description}</ErrorText>
                    )}

                    {serverError && (
                        <Alert
                            type="error"
                            message={serverError}
                            onClose={() => setServerError(null)}
                        />
                    )}

                    <div className="flex justify-end gap-3 pt-1">
                        <Button
                            text={isSubmitting ? "Modificando..." : "Modificar"}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            width="w-auto"
                            height="h-[38px]"
                            textSize="text-sm"
                            fontWeight="font-bold"
                            bgColor="bg-white"
                            hoverColor="hover:bg-neutral-100"
                            activeColor="active:bg-neutral-200"
                            className="px-5 shadow-[0_0_5px_rgba(30,58,95,0.35)]"
                        />
                        <Button
                            text="Cancelar"
                            onClick={onClose}
                            disabled={isSubmitting}
                            width="w-auto"
                            height="h-[38px]"
                            textSize="text-sm"
                            fontWeight="font-bold"
                            bgColor="bg-[#1E3A5F]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#162d4a]"
                            activeColor="active:bg-[#0f1f33]"
                            className="px-5"
                        />
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
