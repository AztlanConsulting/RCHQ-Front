import React, { useEffect } from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import CalendarFilters from "../components/molecules/calendarFilters";
import Alert from "../components/atoms/alerts";
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
    calendarMode,
    setCalendarMode,
    calendarModeOptions,
    canSwitchCalendarMode,
    toggleList,
    setMonthView,
    setWeekView,
    setDayView,
    generateTitle,
    getWeekDayName,
    resizeHandler,
    setOwnCalendar,
    selectedDates,
    closeCreationModal,
    handleDateDrags,
    handleDateDragging,
    reloadCurrentRange,
  } = useBaseCalendar();

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

  const {
    selectedEvent,
    isAbsenceEditing,
    absenceForm,
    absenceEditError,
    isSavingAbsence,
    alert,
    absenceEvidenceFileName,
    absenceEvidenceError,
    closeDetail,
    handleEventClick,
    absenceEvidenceLabel,
    openAbsenceEvidence,
    startAbsenceEdit,
    cancelAbsenceEdit,
    setAbsenceField,
    handleAbsenceEvidenceChange,
    submitAbsenceEdit,
    clearCalendarAlert,
  } = useCalendarPage({
    absenceTypeOptions,
    reloadCurrentRange,
  });

  useEffect(() => {
    setOwnCalendar();
  }, [setOwnCalendar]);

  return (
    <div className="flex items-center gap-4">
      {alert?.message ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={clearCalendarAlert}
          />
        </div>
      ) : null}

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
        calendarMode={calendarMode}
        onCalendarModeChange={setCalendarMode}
        calendarModeOptions={calendarModeOptions}
        canSwitchCalendarMode={canSwitchCalendarMode}
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
            onDateDrag={handleDateDrags}
            onDateDragging={handleDateDragging}
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
            absenceTypeOptions={absenceTypeOptions}
            absenceForm={absenceForm}
            absenceEditError={absenceEditError}
            absenceEvidenceFileName={absenceEvidenceFileName}
            absenceEvidenceError={absenceEvidenceError}
            isSaving={isSavingAbsence}
            onOpenEvidence={openAbsenceEvidence}
            onStartEdit={startAbsenceEdit}
            onCancelEdit={cancelAbsenceEdit}
            onSubmitEdit={submitAbsenceEdit}
            onAbsenceFieldChange={setAbsenceField}
            onAbsenceEvidenceChange={handleAbsenceEvidenceChange}
          />
        ) : (
          <EventDetail event={selectedEvent} />
        )}
      </Modal>

      <Modal
        open={selectedDates != null}
        onClose={() => closeCreationModal(calendarRef)}
        title="Creación de evento"
        grayBackground={false}
        placement="center"
        className="max-w-[25vw] max-h-[80vh]"
      >
        {/* Aquí añadir el modal de eventos cuando se tenga */
          selectedDates && (
          <p>
            {`De ${selectedDates.startDate.getUTCDate()}/${
              selectedDates.startDate.getUTCMonth() + 1
            }/${selectedDates.startDate.getUTCFullYear()} ${
              selectedDates.startDate.getUTCHours()
            }:${selectedDates.startDate.getUTCMinutes()}:${
              selectedDates.startDate.getUTCSeconds()
            } a ${selectedDates.endDate.getUTCDate()}/${
              selectedDates.endDate.getUTCMonth() + 1
            }/${selectedDates.endDate.getUTCFullYear()} ${
              selectedDates.endDate.getUTCHours()
            }:${selectedDates.endDate.getUTCMinutes()}:${
              selectedDates.endDate.getUTCSeconds()
            }`}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default Calendario;