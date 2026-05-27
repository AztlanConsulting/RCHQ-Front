import { useCallback, useMemo, useRef, useState } from "react";
import {
  calendarItemToDetail,
  eventApiToDetail,
} from "../../utils/calendarEventDetail";
import {
  deleteAbsenceService,
  buildAbsenceEvidenceUrl,
  getEmployeeDateRules,
  updateAbsenceService,
} from "../../services/calendarService";
import { deleteVacationRequest } from "../../services/vacationService";
import {
  approveVacationRequest,
  rejectVacationRequest,
} from "../../services/vacationRequestService";
import { deleteHouseEvent, deletePersonalEvent } from "../../services/deleteEventService";
import { useDocumentFile } from "../atoms/useDocumentFile";
import { useVacationFormEdit } from "./useVacationFormEdit";
import {
  buildAbsenceDateLimits,
  buildAbsenceFormSchema,
} from "../../utils/schema/evento/absence.schema";
import { mergeDateRuleErrors } from "../../utils/dateRules";

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
  const absenceDateLimits = useMemo(() => buildAbsenceDateLimits(), []);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const selectedEventRef = useRef(null);
  const [isAbsenceEditing, setIsAbsenceEditing] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({
    absenceTypeId: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [absenceDateRules, setAbsenceDateRules] = useState(null);
  const [isLoadingAbsenceDateRules, setIsLoadingAbsenceDateRules] = useState(false);
  const [absenceEditError, setAbsenceEditError] = useState("");
  const [isSavingAbsence, setIsSavingAbsence] = useState(false);
  const [isDeleteAbsenceOpen, setIsDeleteAbsenceOpen] = useState(false);
  const [absenceDeleteError, setAbsenceDeleteError] = useState("");
  const [isLoadingWhileDeleting, setIsLoadingWhileDeleting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editingHouseEvent, setEditingHouseEvent] = useState(null);
  const [editingPersonalEvent, setEditingPersonalEvent] = useState(null);
  const [isDeleteHouseEventOpen, setIsDeleteHouseEventOpen] = useState(false);
  const [isDeletingHouseEvent, setIsDeletingHouseEvent] = useState(false);
  const [deleteHouseEventError, setDeleteHouseEventError] = useState("");
  const [isDeletePersonalEventOpen, setIsDeletePersonalEventOpen] = useState(false);
  const [isDeletingPersonalEvent, setIsDeletingPersonalEvent] = useState(false);
  const [deletePersonalEventError, setDeletePersonalEventError] = useState("");
  const [isDeleteVacationOpen, setIsDeleteVacationOpen] = useState(false);
  const [isDeletingVacation, setIsDeletingVacation] = useState(false);
  const [deleteVacationError, setDeleteVacationError] = useState("");
  const [approveVacationRequestModal, setApproveVacationRequestModal] = useState(null);
  const [rejectVacationRequestModal, setRejectVacationRequestModal] = useState(null);
  const [isApprovingVacation, setIsApprovingVacation] = useState(false);
  const [isRejectingVacation, setIsRejectingVacation] = useState(false);
  const [approveVacationError, setApproveVacationError] = useState("");
  const [rejectVacationError, setRejectVacationError] = useState("");
  const {
    isVacationEditing,
    vacationForm,
    vacationEditError,
    isSavingVacation,
    vacationRemainingInfo,
    vacationDateRules,
    isLoadingVacationRemaining,
    startVacationEdit,
    cancelVacationEdit,
    setVacationField,
    submitVacationEdit,
    resetVacationEdit,
  } = useVacationFormEdit({
    selectedEvent,
    selectedEventRef,
    reloadCurrentRange,
    setSelectedEvent,
    setAlert,
  });
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
    setAbsenceDateRules(null);
    setIsLoadingAbsenceDateRules(false);
    setAbsenceDeleteError("");
    setIsDeleteHouseEventOpen(false);
    setDeleteHouseEventError("");
    setIsDeletePersonalEventOpen(false);
    setDeletePersonalEventError("");
    resetAbsenceEvidence();
    resetVacationEdit();
    setIsDeleteVacationOpen(false);
    setDeleteVacationError("");
    setApproveVacationRequestModal(null);
    setRejectVacationRequestModal(null);
    setApproveVacationError("");
    setRejectVacationError("");
  }, [resetAbsenceEvidence, resetVacationEdit]);

  const showEventDetail = useCallback((detail) => {
    selectedEventRef.current = detail;
    setSelectedEvent(detail);
    setIsAbsenceEditing(false);
    setIsDeleteAbsenceOpen(false);
    setAbsenceEditError("");
    setAbsenceDateRules(null);
    setIsLoadingAbsenceDateRules(false);
    setAbsenceDeleteError("");
    setIsDeleteHouseEventOpen(false);
    setDeleteHouseEventError("");
    setIsDeletePersonalEventOpen(false);
    setDeletePersonalEventError("");
    resetVacationEdit();
    setIsDeleteVacationOpen(false);
    setDeleteVacationError("");
    setApproveVacationRequestModal(null);
    setRejectVacationRequestModal(null);
    setApproveVacationError("");
    setRejectVacationError("");
  }, [resetVacationEdit]);

  const openCalendarItemDetail = useCallback((item) => {
    const detail = calendarItemToDetail(item);
    showEventDetail(detail);
  }, [showEventDetail]);

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
    setIsDeleteHouseEventOpen(false);
    setDeleteHouseEventError("");
    setIsDeletePersonalEventOpen(false);
    setDeletePersonalEventError("");
    resetVacationEdit();
    setIsDeleteVacationOpen(false);
    setDeleteVacationError("");
    setApproveVacationRequestModal(null);
    setRejectVacationRequestModal(null);
    setApproveVacationError("");
    setRejectVacationError("");
  }, [resetVacationEdit]);

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

    const employeeId = currentSelectedEvent.employeeId ?? currentSelectedEvent.id;

    if (employeeId) {
      setIsLoadingAbsenceDateRules(true);

      getEmployeeDateRules(employeeId, "absence")
        .then(setAbsenceDateRules)
        .catch(() => setAbsenceDateRules(null))
        .finally(() => setIsLoadingAbsenceDateRules(false));
    }
  }, [absenceTypeOptions, resetAbsenceEvidence, selectedEvent]);

  const cancelAbsenceEdit = useCallback(() => {
    setIsAbsenceEditing(false);
    setAbsenceEditError("");
    setAbsenceDateRules(null);
    setIsLoadingAbsenceDateRules(false);
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

    const validationResult = buildAbsenceFormSchema(absenceDateLimits).safeParse({
      employeeId: String(
        currentSelectedEvent.employeeId ?? currentSelectedEvent.id ?? "employee",
      ),
      absenceTypeId: String(absenceForm.absenceTypeId ?? ""),
      startDate: absenceForm.startDate,
      endDate: absenceForm.endDate,
      description: normalizedDescription,
    });

    const schemaErrors = validationResult.success
      ? {}
      : validationResult.error.issues.reduce((acc, issue) => {
        const key = issue.path[issue.path.length - 1];

        if (key && !acc[key]) {
          acc[key] = issue.message;
        }

        return acc;
      }, {});
    const fieldErrors = mergeDateRuleErrors(schemaErrors, {
      startDate: absenceForm.startDate,
      endDate: absenceForm.endDate,
    }, absenceDateRules);

    if (!validationResult.success || Object.values(fieldErrors).some(Boolean)) {
      setAbsenceEditError(
        fieldErrors.startDate ||
          fieldErrors.endDate ||
          validationResult.error?.issues?.[0]?.message ||
          "Revisa los datos de la ausencia.",
      );
      return;
    }

    const validatedAbsence = validationResult.data;

    if (
      validatedAbsence.absenceTypeId &&
      !absenceTypeOptions.some(
        (option) => String(option.value) === String(validatedAbsence.absenceTypeId),
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

    if (String(validatedAbsence.absenceTypeId) !== original.absenceTypeId) {
      payload.absenceTypeId = validatedAbsence.absenceTypeId;
    }
    if (validatedAbsence.startDate !== original.startDate) {
      payload.startDate = validatedAbsence.startDate;
    }
    if (validatedAbsence.endDate !== original.endDate) {
      payload.endDate = validatedAbsence.endDate;
    }
    if (validatedAbsence.description !== original.description) {
      payload.description = validatedAbsence.description;
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
                updatedAbsence?.absenceTypeId ?? validatedAbsence.absenceTypeId,
              employeeName: updatedAbsence?.name ?? currentSelectedEvent.employeeName,
              curp: updatedAbsence?.curp ?? currentSelectedEvent.curp,
              eventType: updatedAbsence?.type ?? currentSelectedEvent.eventType,
              description:
                updatedAbsence?.description ?? validatedAbsence.description,
              link: updatedAbsence?.link ?? currentSelectedEvent.link,
              startDate: updatedAbsence?.startDate ?? validatedAbsence.startDate,
              endDate: updatedAbsence?.endDate ?? validatedAbsence.endDate,
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
    absenceDateLimits,
    absenceForm,
    absenceDateRules,
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

  const openEventEdit = useCallback(() => {
    if (!selectedEvent) return;
    const { focus, scope } = selectedEvent;

    if (focus === "eventos" && scope === "house") {
      setEditingHouseEvent(selectedEvent);
      closeDetail();
      return;
    }

    if (focus === "eventos" && scope === "personal") {
      setEditingPersonalEvent(selectedEvent);
      closeDetail();
      return;
    }

    // TODO: agregar handler para scope "global" cuando esté disponible
    setAlert({
      type: "error",
      message: "No se puede modificar este tipo de evento.",
    });
  }, [closeDetail, selectedEvent]);

  const openEventDelete = useCallback(() => {
    if (!selectedEvent) return;
    const { focus, scope } = selectedEvent;

    if (focus === "eventos" && scope === "house") {
      setDeleteHouseEventError("");
      setIsDeleteHouseEventOpen(true);
      return;
    }

    if (focus === "eventos" && scope === "personal") {
      setDeletePersonalEventError("");
      setIsDeletePersonalEventOpen(true);
      return;
    }

    // TODO: agregar handler para scope "global" cuando esté disponible
  }, [selectedEvent]);

  const cancelDeleteHouseEvent = useCallback(() => {
    setIsDeleteHouseEventOpen(false);
    setDeleteHouseEventError("");
  }, []);

  const cancelDeletePersonalEvent = useCallback(() => {
    setIsDeletePersonalEventOpen(false);
    setDeletePersonalEventError("");
  }, []);

  const confirmDeleteHouseEvent = useCallback(async () => {
    const houseEventId =
      selectedEvent?.houseEventId ?? selectedEvent?.eventId;
    if (!houseEventId) return;

    setIsDeletingHouseEvent(true);
    setDeleteHouseEventError("");

    try {
      await deleteHouseEvent(houseEventId);
      setIsDeleteHouseEventOpen(false);
      closeDetail();

      try {
        await reloadCurrentRange?.();
      } catch (reloadError) {
        console.warn(
          "No se pudo recargar el calendario tras eliminar el evento.",
          reloadError,
        );
      }

      setAlert({
        type: "success",
        message: "Evento eliminado exitosamente",
      });
    } catch (err) {
      setDeleteHouseEventError(
        err?.message ?? "Error al eliminar el evento",
      );
    } finally {
      setIsDeletingHouseEvent(false);
    }
  }, [closeDetail, reloadCurrentRange, selectedEvent]);

  const confirmDeletePersonalEvent = useCallback(async () => {
    const personalEventId = selectedEvent?.eventId;
    if (!personalEventId) return;

    setIsDeletingPersonalEvent(true);
    setDeletePersonalEventError("");

    try {
      await deletePersonalEvent(personalEventId);
      setIsDeletePersonalEventOpen(false);
      closeDetail();

      try {
        await reloadCurrentRange?.();
      } catch (reloadError) {
        console.warn(
          "No se pudo recargar el calendario tras eliminar el evento.",
          reloadError,
        );
      }

      setAlert({
        type: "success",
        message: "Evento eliminado exitosamente",
      });
    } catch (err) {
      setDeletePersonalEventError(
        err?.message ?? "Error al eliminar el evento",
      );
    } finally {
      setIsDeletingPersonalEvent(false);
    }
  }, [closeDetail, reloadCurrentRange, selectedEvent]);

  const onHouseEventEditSuccess = useCallback(async () => {
    const houseEventId = editingHouseEvent?.houseEventId;
    setEditingHouseEvent(null);

    const rawEvents = await reloadCurrentRange?.();

    const refreshedEvent = rawEvents?.find(
      (ev) =>
        ev.focus === "eventos" &&
        ev.scope === "house" &&
        String(ev.houseEventId) === String(houseEventId),
    );

    if (refreshedEvent) {
      showEventDetail(calendarItemToDetail(refreshedEvent));
    }

    setAlert({
      type: "success",
      message: "Evento modificado exitosamente",
    });
  }, [editingHouseEvent, reloadCurrentRange, showEventDetail]);

  const onPersonalEventEditSuccess = useCallback(async () => {
    const personalEventId = editingPersonalEvent?.eventId;
    setEditingPersonalEvent(null);

    const rawEvents = await reloadCurrentRange?.();

    const refreshedEvent = rawEvents?.find(
      (ev) =>
        ev.focus === "eventos" &&
        ev.scope === "personal" &&
        String(ev.eventId) === String(personalEventId),
    );

    if (refreshedEvent) {
      showEventDetail(calendarItemToDetail(refreshedEvent));
    }

    setAlert({
      type: "success",
      message: "Evento modificado exitosamente",
    });
  }, [editingPersonalEvent, reloadCurrentRange, showEventDetail]);
  const getVacationRequestId = useCallback((event) =>
    event?.vacationRequestId ??
    event?.vacationId ??
    "",
    [],);

  const buildVacationRequestFromEvent = useCallback((event) => {
    const vacationRequestId = getVacationRequestId(event);

    if (!event || !vacationRequestId) return null;

    return {
      vacationRequestId,
      startDate: event.startDate,
      endDate: event.endDate,
      usedDays: event.usedDays,
      status: event.status,
      statusLabel: event.statusLabel,
      feedback: event.feedback ?? event.vacationFeedback ?? "",
      employeeId: event.employeeId,
      employee: {
        employeeId: event.employeeId,
        fullName: event.employeeName,
        curp: event.curp,
        picture: event.picture,
      },
    };
  }, [getVacationRequestId]);
  
    const openDeleteVacation = useCallback(() => {
    const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;
    const vacationRequestId = getVacationRequestId(currentSelectedEvent);

    if (!vacationRequestId) return;

    resetVacationEdit();
    setDeleteVacationError("");
    setIsDeleteVacationOpen(true);
  }, [getVacationRequestId, resetVacationEdit, selectedEvent]);

  const cancelDeleteVacation = useCallback(() => {
    setIsDeleteVacationOpen(false);
    setDeleteVacationError("");
  }, []);

  const confirmDeleteVacation = useCallback(async () => {
    const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;
    const vacationRequestId = getVacationRequestId(currentSelectedEvent);

    if (!vacationRequestId) return;

    setIsDeletingVacation(true);
    setDeleteVacationError("");

    try {
      await deleteVacationRequest(vacationRequestId);

      setIsDeleteVacationOpen(false);
      closeDetail();

      try {
        await reloadCurrentRange?.();
      } catch (reloadError) {
        console.warn(
          "No se pudo recargar el calendario tras eliminar las vacaciones.",
          reloadError,
        );
      }

      setAlert({
        type: "success",
        message: "Vacaciones eliminadas correctamente",
      });
    } catch (error) {
      setDeleteVacationError(
        error?.message || "No se pudieron eliminar las vacaciones.",
      );
    } finally {
      setIsDeletingVacation(false);
    }
  }, [
    closeDetail,
    getVacationRequestId,
    reloadCurrentRange,
    selectedEvent,
    selectedEventRef,
  ]);

  const openApproveVacation = useCallback(() => {
    const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;
    const request = buildVacationRequestFromEvent(currentSelectedEvent);

    if (!request) return;

    resetVacationEdit();
    setApproveVacationError("");
    setRejectVacationError("");
    setApproveVacationRequestModal(request);
  }, [buildVacationRequestFromEvent, resetVacationEdit, selectedEvent]);

  const cancelApproveVacation = useCallback(() => {
    setApproveVacationRequestModal(null);
    setApproveVacationError("");
  }, []);

  const confirmApproveVacation = useCallback(async () => {
    const vacationRequestId = approveVacationRequestModal?.vacationRequestId;

    if (!vacationRequestId) return;

    setIsApprovingVacation(true);
    setApproveVacationError("");

    try {
      await approveVacationRequest(vacationRequestId);

      setApproveVacationRequestModal(null);
      closeDetail();

      try {
        await reloadCurrentRange?.();
      } catch (reloadError) {
        console.warn(
          "No se pudo recargar el calendario tras aprobar la solicitud de vacaciones.",
          reloadError,
        );
      }

      setAlert({
        type: "success",
        message: "Solicitud de vacaciones aprobada correctamente",
      });
    } catch (error) {
      setApproveVacationError(
        error?.message || "No se pudo aprobar la solicitud de vacaciones.",
      );
    } finally {
      setIsApprovingVacation(false);
    }
  }, [approveVacationRequestModal, closeDetail, reloadCurrentRange]);

  const openRejectVacation = useCallback(() => {
    const currentSelectedEvent = selectedEventRef.current ?? selectedEvent;
    const request = buildVacationRequestFromEvent(currentSelectedEvent);

    if (!request) return;

    resetVacationEdit();
    setApproveVacationError("");
    setRejectVacationError("");
    setRejectVacationRequestModal(request);
  }, [buildVacationRequestFromEvent, resetVacationEdit, selectedEvent]);

  const cancelRejectVacation = useCallback(() => {
    setRejectVacationRequestModal(null);
    setRejectVacationError("");
  }, []);

  const confirmRejectVacation = useCallback(async (feedback) => {
    const vacationRequestId = rejectVacationRequestModal?.vacationRequestId;

    if (!vacationRequestId) return;

    setIsRejectingVacation(true);
    setRejectVacationError("");

    try {
      await rejectVacationRequest(vacationRequestId, feedback);

      setRejectVacationRequestModal(null);
      closeDetail();

      try {
        await reloadCurrentRange?.();
      } catch (reloadError) {
        console.warn(
          "No se pudo recargar el calendario tras rechazar la solicitud de vacaciones.",
          reloadError,
        );
      }

      setAlert({
        type: "success",
        message: "Solicitud de vacaciones rechazada correctamente",
      });
    } catch (error) {
      setRejectVacationError(
        error?.message || "No se pudo rechazar la solicitud de vacaciones.",
      );
    } finally {
      setIsRejectingVacation(false);
    }
  }, [closeDetail, rejectVacationRequestModal, reloadCurrentRange]);

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
    setAlert,
    absenceEvidenceFileName,
    absenceEvidenceError,
    absenceMinStartDate: absenceDateLimits.minStartDate,
    absenceMaxEndDate: absenceDateLimits.maxEndDate,
    absenceDateRules,
    isLoadingAbsenceDateRules,
    closeDetail,
    showEventDetail,
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
    editingHouseEvent,
    setEditingHouseEvent,
    editingPersonalEvent,
    setEditingPersonalEvent,
    onPersonalEventEditSuccess,
    isDeleteHouseEventOpen,
    isDeletingHouseEvent,
    deleteHouseEventError,
    isDeletePersonalEventOpen,
    isDeletingPersonalEvent,
    deletePersonalEventError,
    openEventEdit,
    openEventDelete,
    cancelDeleteHouseEvent,
    confirmDeleteHouseEvent,
    cancelDeletePersonalEvent,
    confirmDeletePersonalEvent,
    onHouseEventEditSuccess,
    isVacationEditing,
    vacationForm,
    vacationEditError,
    isSavingVacation,
    startVacationEdit,
    cancelVacationEdit,
    setVacationField,
    submitVacationEdit,
    vacationRemainingInfo,
    vacationDateRules,
    isLoadingVacationRemaining,
    openCalendarItemDetail,
    isDeleteVacationOpen,
    isDeletingVacation,
    deleteVacationError,
    openDeleteVacation,
    cancelDeleteVacation,
    confirmDeleteVacation,
    approveVacationRequestModal,
    rejectVacationRequestModal,
    isApprovingVacation,
    isRejectingVacation,
    approveVacationError,
    rejectVacationError,
    openApproveVacation,
    cancelApproveVacation,
    confirmApproveVacation,
    openRejectVacation,
    cancelRejectVacation,
    confirmRejectVacation,
  };
};
