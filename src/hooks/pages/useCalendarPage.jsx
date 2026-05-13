import { useCallback, useMemo, useState } from "react";
import { eventApiToDetail } from "../../utils/calendarEventDetail";

export const useCalendarPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAbsenceEditing, setIsAbsenceEditing] = useState(false);

  const closeDetail = useCallback(() => {
    setSelectedEvent(null);
    setIsAbsenceEditing(false);
  }, []);

  const handleEventClick = useCallback((info) => {
    const detail = eventApiToDetail(info?.event);
    setSelectedEvent(detail);
    setIsAbsenceEditing(false);
  }, []);

  const absenceEvidenceLabel = useMemo(
    () => (selectedEvent?.link ? "Ver evidencia" : "Subir evidencia"),
    [selectedEvent?.link],
  );

  const openAbsenceEvidence = useCallback(() => {
    if (!selectedEvent?.link) return;
    window.open(selectedEvent.link, "_blank", "noopener,noreferrer");
  }, [selectedEvent]);

  return {
    selectedEvent,
    isAbsenceEditing,
    closeDetail,
    handleEventClick,
    absenceEvidenceLabel,
    openAbsenceEvidence,
    startAbsenceEdit: () => setIsAbsenceEditing(true),
    cancelAbsenceEdit: () => setIsAbsenceEditing(false),
  };
};
