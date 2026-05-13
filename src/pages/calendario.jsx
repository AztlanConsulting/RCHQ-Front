import React, { useEffect } from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import CalendarFilters from "../components/molecules/calendarFilters";
import Modal from "../components/atoms/modal";
import EventDetail from "../components/molecules/calendarCards/eventDetail";
import AbsenceDetail from "../components/molecules/calendarCards/absenceDetail";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../hooks/organism/useCalendarFilters";
import { useCalendarPage } from "../hooks/pages/useCalendarPage";

const Calendario = () => {
  const calendarRef = React.useRef(null);

  const {
    employeeHouseName,
    allEvents,
    isList,
    handleDatesSet,
    loadButtonsAtStart,
    viewerRole,
    toggleList,
    setMonthView,
    setWeekView,
    setDayView,
    generateTitle,
    getWeekDayName,
    resizeHandler,
    setOwnCalendar,
  } = useBaseCalendar();

  const {
    selectedEvent,
    isAbsenceEditing,
    closeDetail,
    handleEventClick,
    absenceEvidenceLabel,
    openAbsenceEvidence,
    startAbsenceEdit,
    cancelAbsenceEdit,
  } = useCalendarPage();

  const {
    focusFilters,
    setFocusFilters,
    focusOptions,
    scopeFilters,
    setScopeFilters,
    scopeOptions,
    eventTypeFilters,
    setEventTypeFilters,
    eventTypeOptions,
    vacationStatusFilters,
    setVacationStatusFilters,
    vacationStatusOptions,
    absenceTypeFilters,
    setAbsenceTypeFilters,
    absenceTypeOptions,
    absenceEmployeeFilters,
    filteredAbsenceEmployeeOptions,
    absenceEmployeeSearch,
    selectedAbsenceEmployeeLabel,
    setAbsenceEmployeeSearch,
    toggleAbsenceEmployeeValue,
    clearAbsenceEmployeeSelection,
    absenceStatusFilters,
    setAbsenceStatusFilters,
    absenceStatusOptions,
    absenceEvidenceFilters,
    setAbsenceEvidenceFilters,
    absenceEvidenceOptions,
    showEventFilters,
    showVacationFilters,
    showAbscenceFilters,
    visibleEvents,
  } = useCalendarFilters(allEvents, { isList });

  useEffect(() => {
    setOwnCalendar();
  }, [setOwnCalendar]);

  return (
    <div className="flex items-center gap-4">
      <CalendarFilters
        className="basis-1/6 min-w-40 "
        houseName={employeeHouseName}
        focusFilters={focusFilters}
        setFocusFilters={setFocusFilters}
        focusOptions={focusOptions}
        scopeFilters={scopeFilters}
        setScopeFilters={setScopeFilters}
        scopeOptions={scopeOptions}
        eventTypeFilters={eventTypeFilters}
        setEventTypeFilters={setEventTypeFilters}
        eventTypeOptions={eventTypeOptions}
        vacationStatusFilters={vacationStatusFilters}
        setVacationStatusFilters={setVacationStatusFilters}
        vacationStatusOptions={vacationStatusOptions}
        absenceTypeFilters={absenceTypeFilters}
        setAbsenceTypeFilters={setAbsenceTypeFilters}
        absenceTypeOptions={absenceTypeOptions}
        absenceEmployeeFilters={absenceEmployeeFilters}
        filteredAbsenceEmployeeOptions={filteredAbsenceEmployeeOptions}
        absenceEmployeeSearch={absenceEmployeeSearch}
        selectedAbsenceEmployeeLabel={selectedAbsenceEmployeeLabel}
        setAbsenceEmployeeSearch={setAbsenceEmployeeSearch}
        toggleAbsenceEmployeeValue={toggleAbsenceEmployeeValue}
        clearAbsenceEmployeeSelection={clearAbsenceEmployeeSelection}
        absenceStatusFilters={absenceStatusFilters}
        setAbsenceStatusFilters={setAbsenceStatusFilters}
        absenceStatusOptions={absenceStatusOptions}
        absenceEvidenceFilters={absenceEvidenceFilters}
        setAbsenceEvidenceFilters={setAbsenceEvidenceFilters}
        absenceEvidenceOptions={absenceEvidenceOptions}
        showEventFilters={showEventFilters}
        showVacationFilters={showVacationFilters}
        showAbscenceFilters={showAbscenceFilters}
        viewerRole={viewerRole}
      />

      <div className="flex-1">
        <BaseCalendar
            loadButtonsAtStart={loadButtonsAtStart}
            calendarRef={calendarRef}
            toggleList={toggleList}
            setMonthView={setMonthView}
            setWeekView={setWeekView}
            setDayView={setDayView}
            generateTitle={generateTitle}
            getWeekDayName={getWeekDayName}
            resizeHandler={resizeHandler}
            visibleEvents={visibleEvents}
            handleDatesSet={handleDatesSet}
            onEventClick={handleEventClick}
        />
      </div>

      <Modal
        open={selectedEvent != null}
        onClose={closeDetail}
        title={selectedEvent?.focus === "ausencias" ? null : "Detalle del evento"}
        grayBackground={false}
        placement="right"
        className={
          selectedEvent?.focus === "ausencias"
            ? "w-[92vw] max-w-[32rem] sm:max-w-[34rem] lg:max-w-[32rem] max-h-[80vh]"
            : "max-w-[25vw] max-h-[80vh]"
        }
      >
        {selectedEvent?.focus === "ausencias" ? (
          <AbsenceDetail
            event={selectedEvent}
            isEditing={isAbsenceEditing}
            evidenceLabel={absenceEvidenceLabel}
            onOpenEvidence={openAbsenceEvidence}
            onStartEdit={startAbsenceEdit}
            onCancelEdit={cancelAbsenceEdit}
          />
        ) : (
          <EventDetail event={selectedEvent} />
        )}
      </Modal>
    </div>
  );
};

export default Calendario;
