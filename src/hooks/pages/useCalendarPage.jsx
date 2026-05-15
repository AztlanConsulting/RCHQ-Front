import { useCallback, useMemo, useState } from "react";
import {
    calendarItemToDetail,
    eventApiToDetail,
} from "../../utils/calendarEventDetail";
import { updateAbsenceService } from "../../services/calendarService";

const sanitizeAbsenceDescription = (value = "") =>
    String(value)
        .replace(/[\p{Extended_Pictographic}\p{So}]/gu, "")
        .replace(/\s+/g, " ")
        .slice(0, 300);

const inferAbsenceTypeId = (selectedEvent, absenceTypeOptions) => {
    if (selectedEvent?.absenceTypeId) {
        return String(selectedEvent.absenceTypeId);
    }

    const normalizedEventType = String(selectedEvent?.eventType ?? "")
        .trim()
        .toLowerCase();

    const matchedOption = absenceTypeOptions.find((option) => {
        const normalizedLabel = String(option.label ?? "")
            .trim()
            .toLowerCase();
        const normalizedName = String(option.normalizedName ?? "")
            .trim()
            .toLowerCase();

        return (
            normalizedLabel === normalizedEventType ||
            normalizedName === normalizedEventType
        );
    });

    return matchedOption ? String(matchedOption.value) : "";
};

export const useCalendarPage = ({
    absenceTypeOptions = [],
    reloadCurrentRange,
} = {}) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isAbsenceEditing, setIsAbsenceEditing] = useState(false);
    const [absenceForm, setAbsenceForm] = useState({
        absenceTypeId: "",
        startDate: "",
        endDate: "",
        description: "",
    });
    const [absenceEditError, setAbsenceEditError] = useState("");
    const [isSavingAbsence, setIsSavingAbsence] = useState(false);
    const [alert, setAlert] = useState(null);

    const closeDetail = useCallback(() => {
        setSelectedEvent(null);
        setIsAbsenceEditing(false);
        setAbsenceEditError("");
    }, []);

    const handleEventClick = useCallback((info) => {
        const detail = eventApiToDetail(info?.event);
        setSelectedEvent(detail);
        setIsAbsenceEditing(false);
        setAbsenceEditError("");
    }, []);

    const absenceEvidenceLabel = useMemo(
        () => (selectedEvent?.link ? "Ver evidencia" : "Subir evidencia"),
        [selectedEvent?.link],
    );

    const openAbsenceEvidence = useCallback(() => {
        if (!selectedEvent?.link) return;
        window.open(selectedEvent.link, "_blank", "noopener,noreferrer");
    }, [absenceTypeOptions, selectedEvent]);

    const startAbsenceEdit = useCallback(() => {
        if (!selectedEvent) return;

        setAbsenceForm({
            absenceTypeId: inferAbsenceTypeId(
                selectedEvent,
                absenceTypeOptions,
            ),
            startDate: String(selectedEvent.startDate ?? "").slice(0, 10),
            endDate: String(selectedEvent.endDate ?? "").slice(0, 10),
            description: selectedEvent.description ?? "",
        });
        setAbsenceEditError("");
        setIsAbsenceEditing(true);
    }, [absenceTypeOptions, selectedEvent]);

    const cancelAbsenceEdit = useCallback(() => {
        setIsAbsenceEditing(false);
        setAbsenceEditError("");
    }, []);

    const setAbsenceField = useCallback((field, value) => {
        setAbsenceForm((prev) => ({
            ...prev,
            [field]:
                field === "description"
                    ? sanitizeAbsenceDescription(value)
                    : value,
        }));
    }, []);

    const submitAbsenceEdit = useCallback(async () => {
        if (!selectedEvent?.absenceId) return;

        const normalizedDescription = sanitizeAbsenceDescription(
            absenceForm.description,
        ).trim();

        const original = {
            absenceTypeId: inferAbsenceTypeId(
                selectedEvent,
                absenceTypeOptions,
            ),
            startDate: String(selectedEvent.startDate ?? "").slice(0, 10),
            endDate: String(selectedEvent.endDate ?? "").slice(0, 10),
            description: String(selectedEvent.description ?? "").trim(),
        };

        if (!absenceForm.startDate || !absenceForm.endDate) {
            setAbsenceEditError(
                "Debes ingresar fecha de inicio y fecha de fin.",
            );
            return;
        }

        if (absenceForm.endDate < absenceForm.startDate) {
            setAbsenceEditError(
                "La fecha de fin no puede ser menor a la fecha de inicio.",
            );
            return;
        }

        if (
            absenceForm.absenceTypeId &&
            !absenceTypeOptions.some(
                (option) =>
                    String(option.value) === String(absenceForm.absenceTypeId),
            )
        ) {
            setAbsenceEditError("Tipo de ausencia inválido.");
            return;
        }

        const payload = {};

        if (String(absenceForm.absenceTypeId) !== original.absenceTypeId) {
            payload.absenceTypeId = absenceForm.absenceTypeId;
        }
        if (absenceForm.startDate !== original.startDate) {
            payload.startDate = absenceForm.startDate;
        }
        if (absenceForm.endDate !== original.endDate) {
            payload.endDate = absenceForm.endDate;
        }
        if (normalizedDescription !== original.description) {
            payload.description = normalizedDescription;
        }

        if (Object.keys(payload).length === 0) {
            setIsAbsenceEditing(false);
            setAbsenceEditError("");
            return;
        }

        setIsSavingAbsence(true);
        setAbsenceEditError("");

        try {
            const updatedAbsence = await updateAbsenceService(
                selectedEvent.absenceId,
                payload,
            );

            const refreshedEvents = await reloadCurrentRange?.();
            const refreshedAbsence = refreshedEvents?.find(
                (event) =>
                    event.focus === "ausencias" &&
                    String(event.absenceId) === String(selectedEvent.absenceId),
            );

            setSelectedEvent(
                refreshedAbsence
                    ? calendarItemToDetail(refreshedAbsence)
                    : {
                          ...selectedEvent,
                          absenceId:
                              updatedAbsence?.absenceId ??
                              selectedEvent.absenceId,
                          absenceTypeId:
                              updatedAbsence?.absenceTypeId ??
                              absenceForm.absenceTypeId,
                          employeeName:
                              updatedAbsence?.name ??
                              selectedEvent.employeeName,
                          curp: updatedAbsence?.curp ?? selectedEvent.curp,
                          eventType:
                              updatedAbsence?.type ?? selectedEvent.eventType,
                          description:
                              updatedAbsence?.description ??
                              normalizedDescription,
                          link: updatedAbsence?.link ?? selectedEvent.link,
                          startDate:
                              updatedAbsence?.startDate ??
                              absenceForm.startDate,
                          endDate:
                              updatedAbsence?.endDate ?? absenceForm.endDate,
                          isDeleted:
                              updatedAbsence?.isDeleted ??
                              selectedEvent.isDeleted,
                      },
            );

            setAlert({
                type: "success",
                message: "Ausencia actualizada correctamente",
            });
            setIsAbsenceEditing(false);
        } catch (error) {
            setAbsenceEditError(
                error?.message || "No se pudo actualizar la ausencia.",
            );
        } finally {
            setIsSavingAbsence(false);
        }
    }, [absenceForm, absenceTypeOptions, reloadCurrentRange, selectedEvent]);

    return {
        selectedEvent,
        isAbsenceEditing,
        absenceForm,
        absenceEditError,
        isSavingAbsence,
        alert,
        closeDetail,
        handleEventClick,
        absenceEvidenceLabel,
        openAbsenceEvidence,
        startAbsenceEdit,
        cancelAbsenceEdit,
        setAbsenceField,
        submitAbsenceEdit,
        clearCalendarAlert: () => setAlert(null),
    };
};
