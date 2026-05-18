import Type from "../components/atoms/type";
import { useCallback, useEffect, useRef } from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import CalendarFilters from "../components/molecules/calendarFilters";
import CalendarFiltersModal from "../components/molecules/calendarFiltersModal";
import Alert from "../components/atoms/alerts";
import Modal from "../components/atoms/modal";
import EventDetail from "../components/molecules/calendarCards/eventDetail";
import AbsenceDetail from "../components/molecules/calendarCards/absenceDetail";
import RegisterHouseEventModal from "../components/organism/evento/registerEventModal";
import WorkerAbsenceDetail from "../components/molecules/calendarCards/workerAbsenceDetail";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../hooks/organism/useCalendarFilters";
import { useCalendarPage } from "../hooks/pages/useCalendarPage";

const isManagementRole = (role) => role === "Admin" || role === "Coordinador";

const Calendario = () => {
    const calendarRef = useRef(null);
    const prevFullCalendarViewTypeRef = useRef(null);

    const {
        employeeHouseName,
        allEvents,
        isList,
        viewType,
        currentCalendarView,
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
        openCreationModal,
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
        filtersModalOpen,
        setFiltersModalOpen,
        visibleEvents,
    } = useCalendarFilters(allEvents, { isList, viewerRole });

    const {
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
        clearCalendarAlert,
      } = useCalendarPage({
        absenceTypeOptions,
        reloadCurrentRange,
        viewerRole,
    });
    const isAbsenceDetailOpen = selectedEvent?.focus === "ausencias";

    const handleDatesSetAndCloseDetailOnViewChange = useCallback(
        async (dateInfo) => {
            const nextViewType = dateInfo?.view?.type;
            if (
                prevFullCalendarViewTypeRef.current != null &&
                nextViewType != null &&
                prevFullCalendarViewTypeRef.current !== nextViewType
            ) {
                closeDetail();
            }
            if (nextViewType != null) {
                prevFullCalendarViewTypeRef.current = nextViewType;
            }
            await handleDatesSet(dateInfo);
        },
        [closeDetail, handleDatesSet],
    );

    useEffect(() => {
      setOwnCalendar();
    }, [setOwnCalendar]);

  const calendarFiltersProps = {
    houseName: employeeHouseName,
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
    viewerRole,
    calendarMode,
    onCalendarModeChange: setCalendarMode,
    calendarModeOptions,
    canSwitchCalendarMode,
  };

  return (
    <div className="relative flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
      {alert?.message ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={clearCalendarAlert}
          />
        </div>
      ) : null}

      <CalendarFiltersModal
        open={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        {...calendarFiltersProps}
      />

      <CalendarFilters
        {...calendarFiltersProps}
        className="mb-auto hidden w-full shrink-0 sm:min-w-0 lg:flex lg:basis-64 lg:max-w-xs xl:basis-1/6"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {employeeHouseName ? (
          <Type
            variant="page-title"
            as="h2"
            className="mb-0 w-full min-w-0 text-center md:text-left lg:hidden"
          >
            {employeeHouseName}
          </Type>
        ) : null}

        <BaseCalendar
          key={`${viewType}-${isList}`}
          initialView={currentCalendarView}
          loadButtonsAtStart={loadButtonsAtStart}
          calendarRef={calendarRef}
          toggleList={toggleList}
          setMonthView={setMonthView}
          setWeekView={setWeekView}
          setDayView={setDayView}
          openCreationModal={openCreationModal}
          generateTitle={generateTitle}
          getWeekDayName={getWeekDayName}
          resizeHandler={resizeHandler}
          visibleEvents={visibleEvents}
          handleDatesSet={handleDatesSetAndCloseDetailOnViewChange}
          onEventClick={handleEventClick}
          onDateDrag={handleDateDrags}
          onDateDragging={handleDateDragging}
          onOpenCalendarFilters={() => setFiltersModalOpen(true)}
        />
      </div>

      <Modal
        open={selectedEvent != null}
        onClose={closeDetail}
        title={selectedEvent?.focus === "ausencias" ? null : "Detalle del evento"}
        grayBackground={isAbsenceDetailOpen}
        placement={isAbsenceDetailOpen ? "center" : "right"}
        className={
          selectedEvent?.focus === "ausencias"
            ? "w-[92vw] max-w-[32rem] sm:max-w-[34rem] lg:max-w-[32rem] max-h-[80vh]"
            : "w-[92vw] max-w-[400px] max-h-[80vh]"
        }
      >
        {selectedEvent?.focus === "ausencias" ? (
          isManagementRole(viewerRole) ? (
            <AbsenceDetail
              event={selectedEvent}
              isEditing={isAbsenceEditing}
              evidenceLabel={absenceEvidenceLabel}
              absenceTypeOptions={absenceTypeOptions}
              absenceForm={absenceForm}
              absenceEditError={absenceEditError}
              absenceDeleteError={absenceDeleteError}
              absenceEvidenceFileName={absenceEvidenceFileName}
              absenceEvidenceError={absenceEvidenceError}
              isSaving={isSavingAbsence}
              isDeleteOpen={isDeleteAbsenceOpen}
              isLoadingWhileDeleting={isLoadingWhileDeleting}
              canManageAbsence={isManagementRole(viewerRole)}
              onOpenEvidence={openAbsenceEvidence}
              onStartEdit={startAbsenceEdit}
              onCancelEdit={cancelAbsenceEdit}
              onSubmitEdit={submitAbsenceEdit}
              onOpenDelete={openDeleteAbsence}
              onCancelDelete={cancelDeleteAbsence}
              onConfirmDelete={confirmDeleteAbsence}
              onAbsenceFieldChange={setAbsenceField}
              onAbsenceEvidenceChange={handleAbsenceEvidenceChange}
            />
          ) : (
            <WorkerAbsenceDetail
              event={selectedEvent}
              evidenceLabel={absenceEvidenceLabel}
              onOpenEvidence={openAbsenceEvidence}
              onClose={closeDetail}
            />
          )
        ) : (
          <EventDetail event={selectedEvent} />
        )}
      </Modal>

      <RegisterHouseEventModal
        isOpen={selectedDates != null}
        onClose={() => closeCreationModal(calendarRef)}
        onSuccess={() => {
          closeCreationModal(calendarRef);
          reloadCurrentRange();
        }}
        initialStartDate={selectedDates?.startDate?.toISOString().split("T")[0]}
        initialEndDate={selectedDates?.endDate?.toISOString().split("T")[0]}
      />
    </div>
  );
};

export default Calendario;
