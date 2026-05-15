import Button from "../../atoms/button";
import DateField from "../../atoms/dateField";
import SelectField from "../../atoms/selectField";
import Type from "../../atoms/type";
import { formatEventDate } from "../../../utils/calendarEventDetail";

const ReadOnlyField = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "col-span-2" : ""}>
        <Type
            variant="metric-label"
            className="mb-1.5 font-bold text-[#121212] block"
        >
            {label}
        </Type>
        <div className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            {value || "—"}
        </div>
    </div>
);

const EditableTextArea = ({ label, value, onChange }) => (
    <div className="sm:col-span-2">
        <Type
            variant="metric-label"
            className="mb-1.5 block font-bold text-[#121212]"
        >
            {label}
        </Type>
        <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
            placeholder="Describe la ausencia"
            className="min-h-[110px] w-full resize-none rounded-lg border border-slate-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-[#222] shadow-[inset_0px_4px_4px_#00000020] outline-none focus:border-slate-400"
        />
    </div>
);

const AbsenceDetail = ({
    event,
    isEditing = false,
    evidenceLabel = "Ver evidencia",
    absenceTypeOptions = [],
    absenceForm,
    absenceEditError = "",
    isSaving = false,
    onOpenEvidence,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
    onAbsenceFieldChange,
}) => {
    if (!event) return null;

    if (isEditing) {
        return (
            <div className="px-2 sm:px-3 text-left">
                <Type variant="page-title" className="mb-3" as="h2">
                    Ausencia
                </Type>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadOnlyField
                        label="Nombre del trabajador"
                        value={event.employeeName}
                    />
                    <ReadOnlyField label="CURP" value={event.curp} />
                    <div className="sm:col-span-2">
                        <SelectField
                            label="Tipo de ausencia"
                            id="absenceTypeId"
                            value={absenceForm?.absenceTypeId ?? ""}
                            onChange={(editEvent) =>
                                onAbsenceFieldChange?.(
                                    "absenceTypeId",
                                    editEvent.target.value,
                                )
                            }
                            options={absenceTypeOptions.map((option) => ({
                                value: option.value,
                                label: option.label,
                            }))}
                            placeholder="Selecciona un tipo"
                            labelColor="text-[#121212]"
                        />
                    </div>
                    <DateField
                        label="Fecha de inicio"
                        name="startDate"
                        value={absenceForm?.startDate ?? ""}
                        onChange={(editEvent) =>
                            onAbsenceFieldChange?.(
                                "startDate",
                                editEvent.target.value,
                            )
                        }
                        labelColor="text-[#121212]"
                    />
                    <DateField
                        label="Fecha de fin"
                        name="endDate"
                        value={absenceForm?.endDate ?? ""}
                        onChange={(editEvent) =>
                            onAbsenceFieldChange?.(
                                "endDate",
                                editEvent.target.value,
                            )
                        }
                        minDate={
                            absenceForm?.startDate
                                ? new Date(`${absenceForm.startDate}T12:00:00`)
                                : undefined
                        }
                        labelColor="text-[#121212]"
                    />
                    <EditableTextArea
                        label="Descripción"
                        value={absenceForm?.description ?? ""}
                        onChange={(value) =>
                            onAbsenceFieldChange?.("description", value)
                        }
                    />
                </div>

                {absenceEditError ? (
                    <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                        {absenceEditError}
                    </p>
                ) : null}

                <div className="mt-4 flex items-center gap-3">
                    <Type
                        variant="metric-label"
                        className="font-bold text-[#121212]"
                    >
                        Evidencia:
                    </Type>
                    <Button
                        type="button"
                        text={
                            event.link ? "Cambiar evidencia" : "Subir evidencia"
                        }
                        width="w-auto min-w-[10.5rem]"
                        height="h-9"
                        textSize="text-sm"
                        bgColor="bg-[#1F3664]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#15284A]"
                        activeColor="active:bg-[#0E1B33]"
                        disabled
                        className="px-4 shadow-md"
                    />
                </div>

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
    }

    return (
        <div className="px-1 text-left sm:px-2">
            <Type
                variant="page-title"
                className="mb-5 text-[2rem] leading-none"
                as="h2"
            >
                Ausencia
            </Type>

            <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Nombre del trabajador
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.employeeName || "—"}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        CURP
                    </Type>
                    <Type
                        variant="body"
                        className="break-all text-[1.05rem] leading-snug sm:break-normal"
                    >
                        {event.curp || "—"}
                    </Type>
                </div>

                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de inicio:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {formatEventDate(event.startDate)}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de fin:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {formatEventDate(event.endDate)}
                    </Type>
                </div>

                <div className="sm:col-span-2">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Tipo de ausencia:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.eventType || "—"}
                    </Type>
                </div>

                <div className="sm:col-span-2">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Descripción:
                    </Type>
                    <Type
                        variant="body"
                        className="whitespace-pre-wrap text-[1.05rem] leading-snug"
                    >
                        {event.description || "—"}
                    </Type>
                </div>

                <div className="sm:col-span-2">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Días hábiles:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.usedDays ?? "—"}
                    </Type>
                </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
                <Type
                    variant="metric-label"
                    className="text-[0.9rem] font-bold text-[#121212]"
                >
                    Evidencia:
                </Type>
                <Button
                    type="button"
                    text={evidenceLabel}
                    width="w-auto min-w-[7.25rem]"
                    height="h-7"
                    textSize="text-xs"
                    bgColor="bg-[#1F3664]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#15284A]"
                    activeColor="active:bg-[#0E1B33]"
                    onClick={onOpenEvidence}
                    disabled={!event.link}
                    className="px-3 rounded-md shadow-[0_3px_8px_rgba(31,54,100,0.28)]"
                />
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-6">
                <Button
                    type="button"
                    text="Eliminar"
                    width="w-full sm:w-[8.2rem]"
                    height="h-10"
                    textSize="text-base"
                    bgColor="bg-[#A20000]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#870000]"
                    activeColor="active:bg-[#6B0000]"
                    className="rounded-md shadow-[0_4px_10px_rgba(166,0,0,0.32)]"
                />
                <Button
                    type="button"
                    text="Editar"
                    width="w-full sm:w-[8.2rem]"
                    height="h-10"
                    textSize="text-base"
                    bgColor="bg-[#1F3664]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#15284A]"
                    activeColor="active:bg-[#0E1B33]"
                    className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                    onClick={onStartEdit}
                />
            </div>
        </div>
    );
};

export default AbsenceDetail;
