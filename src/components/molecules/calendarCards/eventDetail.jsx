import Button from "../../atoms/button";
import Type from "../../atoms/type";
import ConfirmDeleteModal from "../confirmDeleteModal";
import {
    formatEventDateRange,
    formatEventTime,
} from "../../../utils/calendarEventDetail";
import { useExpandableList } from "../../../hooks/atoms/useExpandableList";
import MexicoReferenceNotice from "./mexicoReferenceNotice";

const canDelete = (scope, role) => {
    if (scope === "global") return role === "Administrador";
    if (scope === "house" || scope === "personal") return role === "Coordinador";
    return true;
};

const canEdit = (scope, role) => {
    if (scope === "global") return role === "Administrador";
    if (scope === "house" || scope === "personal") return role === "Coordinador";
    return true;
};

const EventDetail = ({
    event,
    onEdit,
    onDelete,
    isDeleteOpen = false,
    onCancelDelete,
    onConfirmDelete,
    isDeleting = false,
    deleteError = "",
    viewerRole = "",
    calendarTimeZone,
    showMexicoReferenceNotice = false,
}) => {
    const {
        visibleItems: visiblePeople,
        hiddenCount: hiddenPeopleCount,
        isExpanded: isPeopleListExpanded,
        toggleExpanded: togglePeopleList,
    } = useExpandableList(
        event?.peopleInsideEvent,
        5,
        event?.eventId ?? event?.houseEventId ?? event?.id ?? "",
    );

    if (!event) return null;

    const showDelete = canDelete(event.scope, viewerRole);
    const showEdit = canEdit(event.scope, viewerRole);

    const dayText = formatEventDateRange(
        event.date || event.startDate || event.start || event.startStr,
        event.date || event.endDate || event.end || event.endStr,
        { endExclusive: Boolean(event.allDay) && !event.date },
    );

    return (
        <div className="relative text-left">
            <Type variant="page-title" className="mb-2" as="h2">
                {event.title ?? "—"}
            </Type>

            <div className="flex items-center gap-2 mb-2">
                <span
                    className="inline-block size-3 rounded-full shrink-0"
                    style={{
                        backgroundColor:
                            event.borderColor ||
                            event.backgroundColor ||
                            "#ccc",
                    }}
                    aria-hidden
                />
                <Type variant="subtitle" as="span">
                    {event.scopeLabel || event.scope || "—"}
                </Type>
            </div>

            <div className="mb-4">
                <Type variant="subtitle" as="span">
                    {event.focusLabel || event.focus || "—"}
                    {event.eventType ? ` · ${event.eventType}` : ""}
                </Type>
            </div>

            <MexicoReferenceNotice show={showMexicoReferenceNotice} />

            {event.subtitle ? (
                <Type variant="body" className="mb-4 block">
                    {event.subtitle}
                </Type>
            ) : null}

            <div className="w-full flex items-center justify-between gap-4 mb-2">
                <Type variant="metric-label" className="font-bold">
                    Día (calendario):
                </Type>
                <p className="text-sm">{dayText}</p>
            </div>
            {!event.allDay ? (
                <>
                    <div className="w-full flex items-center justify-between gap-4 mb-2">
                        <Type variant="metric-label" className="font-bold">
                            Inicio:
                        </Type>
                        <p className="text-sm">
                            {formatEventTime(event.start ?? event.startStr, {
                                timeZone: calendarTimeZone,
                            })}
                        </p>
                    </div>
                    <div className="w-full flex items-center justify-between gap-4 mb-4">
                        <Type variant="metric-label" className="font-bold">
                            Fin:
                        </Type>
                        <p className="text-sm">
                            {formatEventTime(event.end ?? event.endStr, {
                                timeZone: calendarTimeZone,
                            })}
                        </p>
                    </div>
                </>
            ) : null}

            {event.description ? (
                <div className="mb-4">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Descripción:
                    </Type>
                    <Type
                        variant="body"
                        className="block whitespace-pre-wrap text-[1.05rem] leading-snug text-[#121212]"
                    >
                        {event.description}
                    </Type>
                </div>
            ) : null}

            {visiblePeople.length > 0 ? (
                <div className="mb-4">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Empleados ligados al evento:
                    </Type>
                    <div className="space-y-1">
                        {visiblePeople.map((person, idx) => (
                            <Type
                                key={person?.id ?? idx}
                                variant="body"
                                className="block text-[1.05rem] leading-snug text-[#121212]"
                                as="p"
                            >
                                {person?.name || "-"}
                            </Type>
                        ))}
                        {hiddenPeopleCount > 0 ? (
                            <button
                                type="button"
                                onClick={togglePeopleList}
                                className="text-sm font-bold text-[#1F3664] hover:underline"
                            >
                                {isPeopleListExpanded
                                    ? "Ver menos"
                                    : `Ver ${hiddenPeopleCount} más`}
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {(showDelete || showEdit) ? (
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
                    {showDelete ? (
                        <Button
                            type="button"
                            text="Eliminar"
                            width="w-full sm:w-[7.2rem]"
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#A20000]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#870000]"
                            activeColor="active:bg-[#6B0000]"
                            className="rounded-md shadow-[0_4px_10px_rgba(166,0,0,0.32)]"
                            onClick={onDelete}
                        />
                    ) : null}
                    {showEdit ? (
                        <Button
                            type="button"
                            text="Editar"
                            width="w-full sm:w-[7.2rem]"
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#1F3664]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#15284A]"
                            activeColor="active:bg-[#0E1B33]"
                            className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                            onClick={onEdit}
                        />
                    ) : null}
                </div>
            ) : null}
            {isDeleteOpen ? (
                <ConfirmDeleteModal
                    label={event?.title ?? "este evento"}
                    mode="delete"
                    inline
                    loading={isDeleting}
                    title="Eliminar evento"
                    body={
                        <>
                            ¿Estás seguro que deseas eliminar el evento{" "}
                            <span className="font-semibold text-slate-700">
                                {event?.title ?? "este evento"}
                            </span>
                            ? Esta acción no se puede deshacer.
                            {deleteError ? (
                                <span className="mt-2 block rounded-md bg-red-50 px-3 py-2 text-red-600">
                                    {deleteError}
                                </span>
                            ) : null}
                        </>
                    }
                    onCancel={onCancelDelete}
                    onConfirm={onConfirmDelete}
                />
            ) : null}
        </div>
    );
};

export default EventDetail;
