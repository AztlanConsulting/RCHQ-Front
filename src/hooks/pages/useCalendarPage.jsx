import { useCallback, useMemo, useRef, useState } from "react";
import {
  calendarItemToDetail,
  eventApiToDetail,
} from "../../utils/calendar.utils";
import {
  deleteAbsenceService,
  buildAbsenceEvidenceUrl,
  updateAbsenceService,
} from "../../services/calendarService";
import { useDocumentFile } from "../atoms/useDocumentFile";

const ABSENCE_DESCRIPTION_PATTERN = /^[\p{L}\p{N}\s¿?¡!]+$/u;

const sanitizeAbsenceDescription = (value = "") =>
  String(value)
    .replace(/[^\p{L}\p{N}\s¿?¡!]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, 200);

const canManageAbsenceEvidence = (role) =>
  role === "Administrador" || role === "Coordinador";

const getAbsenceEvidenceLabel = (selectedEvent, viewerRole) => {
  if (!selectedEvent) return "Sin evidencia";
  if (selectedEvent.link) return "Ver evidencia";
  return canManageAbsenceEvidence(viewerRole)
    ? "Subir evidencia"
    : "Sin evidencia";
};

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
  viewerRole = "",
} = {}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const selectedEventRef = useRef(null);
  const [isAbsenceEditing, setIsAbsenceEditing] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({
    absenceTypeId: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [absenceEditError, setAbsenceEditError] = useState("");
  const [isSavingAbsence, setIsSavingAbsence] = useState(false);
  const [isDeleteAbsenceOpen, setIsDeleteAbsenceOpen] = useState(false);
  const [absenceDeleteError, setAbsenceDeleteError] = useState("");
  const [isLoadingWhileDeleting, setIsLoadingWhileDeleting] = useState(false);
  const [alert, setAlert] = useState(null);
  const {
    file: absenceEvidenceFile,
    fileName: absenceEvidenceFileName,
    error: absenceEvidenceError,
    handleFileChange: handleAbsenceEvidenceChange,
    reset: resetAbsenceEvidence,
  } = useDocumentFile();

  const closeDetail = useCallback(() => {
    selectedEventRef.current = null;
    setSelectedEvent(null);
    setIsAbsenceEditing(false);
    setIsDeleteAbsenceOpen(false);
    setAbsenceEditError("");
    setAbsenceDeleteError("");
    resetAbsenceEvidence();
  }, [resetAbsenceEvidence]);

  const showCalendarAlert = useCallback((nextAlert) => {
    setAlert(nextAlert);
  }, []);

  const clearCalendarAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const handleEventClick = useCallback((info) => {
    const detail = eventApiToDetail(info?.event);
    selectedEventRef.current = detail;
    setSelectedEvent(detail);
    setIsAbsenceEditing(false);
    setIsDeleteAbsenceOpen(false);
    setAbsenceEditError("");
    setAbsenceDeleteError("");
  }, []);

  const absenceEvidenceLabel = useMemo(
    () => getAbsenceEvidenceLabel(selectedEvent, viewerRole),
    [selectedEvent, viewerRole],
  );

  const openAbsenceEvidence = useCallback(() => {
    if (!selectedEvent?.link) return;
    window.open(
      buildAbsenceEvidenceUrl(selectedEvent.link),
      "_blank",
      "noopener,noreferrer",
    );
  }, [selectedEvent]);

  const startAbsenceEdit = useCallback(() => {
    const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;
    if (!currentSelectedEvent) return;

    setAbsenceForm({
      absenceTypeId: inferAbsenceTypeId(currentSelectedEvent, absenceTypeOptions),
      startDate: String(currentSelectedEvent.startDate ?? "").slice(0, 10),
      endDate: String(currentSelectedEvent.endDate ?? "").slice(0, 10),
      description: sanitizeAbsenceDescription(currentSelectedEvent.description ?? ""),
    });
    setIsDeleteAbsenceOpen(false);
    setAbsenceEditError("");
    setIsAbsenceEditing(true);
    resetAbsenceEvidence();
  }, [absenceTypeOptions, resetAbsenceEvidence, selectedEvent]);

  const cancelAbsenceEdit = useCallback(() => {
    setIsAbsenceEditing(false);
    setAbsenceEditError("");
    resetAbsenceEvidence();
  }, [resetAbsenceEvidence]);

  const openDeleteAbsence = useCallback(() => {
    if (!selectedEvent?.absenceId) return;
    setIsAbsenceEditing(false);
    setAbsenceEditError("");
    setAbsenceDeleteError("");
    setIsDeleteAbsenceOpen(true);
  }, [selectedEvent?.absenceId]);

  const cancelDeleteAbsence = useCallback(() => {
    setIsDeleteAbsenceOpen(false);
    setAbsenceDeleteError("");
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
    const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;
    if (!currentSelectedEvent?.absenceId) return;

    const normalizedDescription = sanitizeAbsenceDescription(
      absenceForm.description,
    ).trim();

    const original = {
      absenceTypeId: inferAbsenceTypeId(currentSelectedEvent, absenceTypeOptions),
      startDate: String(currentSelectedEvent.startDate ?? "").slice(0, 10),
      endDate: String(currentSelectedEvent.endDate ?? "").slice(0, 10),
      description: sanitizeAbsenceDescription(currentSelectedEvent.description ?? "").trim(),
    };

    if (!absenceForm.startDate || !absenceForm.endDate) {
      setAbsenceEditError("Debes ingresar fecha de inicio y fecha de fin.");
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
        (option) => String(option.value) === String(absenceForm.absenceTypeId),
      )
    ) {
      setAbsenceEditError("Tipo de ausencia inválido.");
      return;
    }

    if (absenceEvidenceError) {
      setAbsenceEditError(absenceEvidenceError);
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

    if (absenceEvidenceFile) {
      payload.file = absenceEvidenceFile;
    }

    if (Object.keys(payload).length === 0) {
      setIsAbsenceEditing(false);
      setAbsenceEditError("");
      resetAbsenceEvidence();
      return;
    }

    setIsSavingAbsence(true);
    setAbsenceEditError("");

    try {
      const updatedAbsence = await updateAbsenceService(
        currentSelectedEvent.absenceId,
        payload,
      );

      const refreshedEvents = await reloadCurrentRange?.();
      const refreshedAbsence = refreshedEvents?.find(
        (event) =>
          event.focus === "ausencias" &&
          String(event.absenceId) === String(currentSelectedEvent.absenceId),
      );

      const nextSelectedEvent =
        refreshedAbsence
          ? calendarItemToDetail(refreshedAbsence)
          : {
              ...currentSelectedEvent,
              absenceId: updatedAbsence?.absenceId ?? currentSelectedEvent.absenceId,
              absenceTypeId:
                updatedAbsence?.absenceTypeId ?? absenceForm.absenceTypeId,
              employeeName: updatedAbsence?.name ?? currentSelectedEvent.employeeName,
              curp: updatedAbsence?.curp ?? currentSelectedEvent.curp,
              eventType: updatedAbsence?.type ?? currentSelectedEvent.eventType,
              description:
                updatedAbsence?.description ?? normalizedDescription,
              link: updatedAbsence?.link ?? currentSelectedEvent.link,
              startDate: updatedAbsence?.startDate ?? absenceForm.startDate,
              endDate: updatedAbsence?.endDate ?? absenceForm.endDate,
              isDeleted: updatedAbsence?.isDeleted ?? currentSelectedEvent.isDeleted,
            };

      selectedEventRef.current = nextSelectedEvent;
      setSelectedEvent(nextSelectedEvent);

      setAlert({
        type: "success",
        message: "Ausencia actualizada correctamente",
      });
      setIsAbsenceEditing(false);
      resetAbsenceEvidence();
    } catch (error) {
      setAbsenceEditError(
        error?.message || "No se pudo actualizar la ausencia.",
      );
    } finally {
      setIsSavingAbsence(false);
    }
  }, [
    absenceEvidenceError,
    absenceEvidenceFile,
    absenceForm,
    absenceTypeOptions,
    reloadCurrentRange,
    resetAbsenceEvidence,
    selectedEvent,
  ]);

  const confirmDeleteAbsence = useCallback(async () => {
    if (!selectedEvent?.absenceId) return;

    setIsLoadingWhileDeleting(true);
    setAbsenceDeleteError("");

    try {
      await deleteAbsenceService(selectedEvent.absenceId);
      closeDetail();

      try {
        await reloadCurrentRange?.();
      } catch (reloadError) {
        console.warn("No se pudo recargar el calendario tras eliminar la ausencia.", reloadError);
      }

      setAlert({
        type: "success",
        message: "Ausencia eliminada correctamente",
      });
    } catch (error) {
      setAbsenceDeleteError(
        error?.message || "No se pudo eliminar la ausencia.",
      );
    } finally {
      setIsLoadingWhileDeleting(false);
    }
  }, [closeDetail, reloadCurrentRange, selectedEvent]);

  return {
    selectedEvent,
    isAbsenceEditing,
    absenceForm,
    absenceEditError,
    isSavingAbsence,
    isDeleteAbsenceOpen,
    absenceDeleteError,
    isLoadingWhileDeleting,
    alert,
    absenceEvidenceFileName,
    absenceEvidenceError,
    closeDetail,
    handleEventClick,
    absenceEvidenceLabel,
    openAbsenceEvidence,
    startAbsenceEdit,
    cancelAbsenceEdit,
    openDeleteAbsence,
    cancelDeleteAbsence,
    confirmDeleteAbsence,
    setAbsenceField,
    handleAbsenceEvidenceChange,
    submitAbsenceEdit,
    showCalendarAlert,
    clearCalendarAlert,
  };
};
