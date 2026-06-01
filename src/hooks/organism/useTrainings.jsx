import { useCallback, useEffect, useMemo, useState } from "react";
import { getStoredUser } from "../../utils/authStorage";
import { getTrainingsService } from "../../services/trainingService";

const getViewerContext = () => {
  const storedUser = getStoredUser();
  return {
    viewerRole: storedUser?.role ?? "",
    employeeId: storedUser?.employeeId ?? storedUser?.id ?? "",
  };
};

const getCalendarTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";

export const useTrainings = (employeeId) => {
  const [trainings, setTrainings] = useState([]);
  const [loadingTrainings, setLoadingTrainings] = useState(Boolean(employeeId));
  const [fetchError, setFetchError] = useState("");
  const [selectedTraining, setSelectedTraining] = useState(null);

  const viewerContext = useMemo(() => getViewerContext(), []);
  const calendarTimeZone = useMemo(() => getCalendarTimeZone(), []);

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
    setSelectedTraining(training);
  }, []);

  const closeTrainingDetail = useCallback(() => {
    setSelectedTraining(null);
  }, []);

  const clearFetchError = useCallback(() => setFetchError(""), []);

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
  };
};
