import { useCallback, useEffect, useMemo, useState } from "react";
import { getStoredUser } from "../../utils/authStorage";
import { getTrainingsService } from "../../services/trainingService";
import { removeEmployeeFromTraining } from "../../services/deleteEventService";
import { getBrowserTimeZone } from "../../utils/timeZone";
import { normalizeTrainingDetail } from "../../utils/calendarEventDetail";

const getViewerContext = () => {
  const storedUser = getStoredUser();
  return {
    viewerRole: storedUser?.role ?? "",
    employeeId: storedUser?.employeeId ?? storedUser?.id ?? "",
  };
};

export const useTrainings = (employeeId, { onRemoveSuccess } = {}) => {
  const [trainings, setTrainings] = useState([]);
  const [loadingTrainings, setLoadingTrainings] = useState(Boolean(employeeId));
  const [fetchError, setFetchError] = useState("");
  const [selectedTraining, setSelectedTraining] = useState(null);

  const [trainingToRemove, setTrainingToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const viewerContext = useMemo(() => getViewerContext(), []);
  const calendarTimeZone = useMemo(() => getBrowserTimeZone(), []);

  const fetchTrainings = useCallback(async () => {
    if (!employeeId) {
      setTrainings([]);
      setLoadingTrainings(false);
      return;
    }

    setLoadingTrainings(true);
    setFetchError("");
    try {
      const response = await getTrainingsService(employeeId);
      setTrainings(response.data || []);
    } catch (err) {
      setFetchError(err.message || "Error al cargar las capacitaciones");
    } finally {
      setLoadingTrainings(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const openTrainingDetail = useCallback((training) => {
    setSelectedTraining(normalizeTrainingDetail(training));
  }, []);

  const closeTrainingDetail = useCallback(() => {
    setSelectedTraining(null);
  }, []);

  const clearFetchError = useCallback(() => setFetchError(""), []);

  const openRemoveConfirm = useCallback((training) => {
    setRemoveError("");
    setTrainingToRemove(training);
  }, []);

  const closeRemoveConfirm = useCallback(() => {
    setTrainingToRemove(null);
    setRemoveError("");
  }, []);

  const confirmRemove = useCallback(async () => {
    if (!trainingToRemove) return;
    const eventId = trainingToRemove.eventId
    if (!eventId) return;

    setIsRemoving(true);
    setRemoveError("");
    try {
      const res = await removeEmployeeFromTraining(eventId, employeeId);
      setTrainings((prev) =>
        prev.filter((t) => (t.eventId ?? t.personalEventId) !== eventId),
      );
      setTrainingToRemove(null);
      onRemoveSuccess?.(res.message ?? "Empleado eliminado de la capacitación correctamente.");
    } catch (err) {
      setRemoveError(err?.message ?? "Error al quitar al empleado de la capacitación");
    } finally {
      setIsRemoving(false);
    }
  }, [trainingToRemove, employeeId, onRemoveSuccess]);

  return {
    trainings,
    loadingTrainings,
    fetchError,
    clearFetchError,
    selectedTraining,
    openTrainingDetail,
    closeTrainingDetail,
    viewerRole: viewerContext.viewerRole,
    ownEmployeeId: viewerContext.employeeId,
    calendarTimeZone,
    trainingToRemove,
    isRemoving,
    removeError,
    openRemoveConfirm,
    closeRemoveConfirm,
    confirmRemove,
  };
};
