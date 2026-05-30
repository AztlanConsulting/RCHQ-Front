import { useEffect, useRef } from "react";
import Type from "../components/atoms/type";
import BaseCalendar from "../components/organism/baseCalendar";
import CalendarFilters from "../components/molecules/calendarFilters";
import CalendarFiltersModal from "../components/molecules/calendarFiltersModal";
import Alert from "../components/atoms/alerts";
import Modal from "../components/atoms/modal";
import EventDetail from "../components/molecules/calendarCards/eventDetail";
import AbsenceDetail from "../components/molecules/calendarCards/absenceDetail";
import VacationDetail from "../components/molecules/calendarCards/vacationDetail";
import VacationWorkerDetail from "../components/molecules/calendarCards/vacationWorkerDetail";
import RegisterHouseEventModal from "../components/organism/evento/registerEventModal";
import RegisterEventModal from "../components/organism/evento/registerEventModal";
import UpdateHouseEventModal from "../components/organism/evento/updateHouseEventModal";
import UpdatePersonalEventModal from "../components/organism/evento/updatePersonalEventModal";
import WorkerAbsenceDetail from "../components/molecules/calendarCards/workerAbsenceDetail";
import ConfirmDeleteVacationModal from "../components/molecules/confirmDeleteVacationModal";
import ConfirmApproveVacationModal from "../components/molecules/confirmApproveVacationModal";
import ConfirmRejectVacationModal from "../components/molecules/confirmRejectVacationModal";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../hooks/organism/useCalendarFilters";
import { useCalendarPage } from "../hooks/pages/useCalendarPage";
import { useCalendarSearchParams } from "../hooks/pages/useCalendarSearchParams";
import { MEXICO_TIME_ZONE } from "../utils/timeZone";

const isManagementRole = (role) =>
    role === "Administrador" || role === "Coordinador";

const Calendario = () => {
    const calendarRef = useRef(null);

    const {
        employeeHouseName,
        allEvents,
        isList,
        viewType,
        currentCalendarView,
        currentCalendarDate,
        handleDatesSet,
        loadButtonsAtStart,
        viewerRole,
        calendarMode,
        setCalendarMode,
        calendarTimeZone,
        calendarNow,
        calendarTimeZoneMode,
        setCalendarTimeZoneMode,
        calendarTimeZoneOptions,
        canSwitchCalendarTimeZone,
        fullCalendarTimeZone,
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
        reloadVisibleRange,
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
        employeeFilters,
        filteredEmployeeOptions,
        employeeSearch,
        selectedEmployeeLabel,
        setEmployeeSearch,
        toggleEmployeeValue,
        clearEmployeeSelection,
        resetEmployeeSelection,
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
    } = useCalendarFilters(allEvents, {
        isList,
        viewerRole,
        calendarMode,
        calendarTimeZone,
    });

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
        setAlert,
        absenceEvidenceFileName,
        absenceEvidenceError,
        absenceMinStartDate,
        absenceMaxEndDate,
        absenceDateRules,
        isLoadingAbsenceDateRules,
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
    } = useCalendarPage({
        absenceTypeOptions,
        reloadCurrentRange,
        viewerRole,
    });

    useEffect(() => {
        setOwnCalendar();
    }, [setOwnCalendar]);

    useCalendarSearchParams({
        calendarRef,
        openCalendarItemDetail,
        reloadVisibleRange,
        setCalendarMode,
    });

    const shouldScrollDetailModal =
        ["eventos", "ausencias", "vacaciones"].includes(
            selectedEvent?.focus,
        );

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
        employeeFilters,
        filteredEmployeeOptions,
        employeeSearch,
        selectedEmployeeLabel,
        setEmployeeSearch,
        toggleEmployeeValue,
        clearEmployeeSelection,
        resetEmployeeSelection,
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
        calendarTimeZoneMode,
        onCalendarTimeZoneModeChange: setCalendarTimeZoneMode,
        calendarTimeZoneOptions,
        canSwitchCalendarTimeZone,
    };
    const showMexicoReferenceNotice =
        calendarTimeZone !== MEXICO_TIME_ZONE &&
        (selectedEvent?.focus === "ausencias" ||
            selectedEvent?.focus === "vacaciones" ||
            selectedEvent?.isFreeDay === true);

    return (
        <div className="relative flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start overflow-visible">
            {alert?.message ? (
                <div className="fixed top-30 left-[5%] right-0 z-50 px-4">
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
                    key={`${viewType}-${isList}-${calendarTimeZoneMode}`}
                    initialView={currentCalendarView}
                    initialDate={currentCalendarDate}
                    timeZone={fullCalendarTimeZone}
                    now={calendarNow}
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
                    handleDatesSet={handleDatesSet}
                    onEventClick={handleEventClick}
                    onDateDrag={handleDateDrags}
                    onDateDragging={handleDateDragging}
                    onOpenCalendarFilters={() => setFiltersModalOpen(true)}
                />
            </div>

            <Modal
                open={selectedEvent != null}
                onClose={closeDetail}
                title={(() => {
                    if (
                        ["ausencias", "vacaciones"].includes(
                            selectedEvent?.focus,
                        )
                    )
                        return null;

                    return "Detalle del evento";
                })()}
                grayBackground={true}
                placement="center"
                scrollable={shouldScrollDetailModal}
                className={
                    ["ausencias", "vacaciones"].includes(selectedEvent?.focus)
                        ? "w-[92vw] max-w-[32rem] sm:max-w-[34rem] lg:max-w-[32rem] max-h-[min(96vh,56rem)]"
                        : "w-[92vw] max-w-[40rem] max-h-[calc(100vh-2rem)] scrollbar-hide"
                }
            >
                {(() => {
                    switch (selectedEvent?.focus) {
                        case "ausencias":
                            return isManagementRole(viewerRole) ? (
                                <AbsenceDetail
                                    event={selectedEvent}
                                    isEditing={isAbsenceEditing}
                                    evidenceLabel={absenceEvidenceLabel}
                                    absenceTypeOptions={absenceTypeOptions}
                                    absenceForm={absenceForm}
                                    absenceEditError={absenceEditError}
                                    absenceDeleteError={absenceDeleteError}
                                    absenceEvidenceFileName={
                                        absenceEvidenceFileName
                                    }
                                    absenceEvidenceError={absenceEvidenceError}
                                    absenceMinStartDate={absenceMinStartDate}
                                    absenceMaxEndDate={absenceMaxEndDate}
                                    absenceDateRules={absenceDateRules}
                                    isLoadingAbsenceDateRules={isLoadingAbsenceDateRules}
                                    isSaving={isSavingAbsence}
                                    isDeleteOpen={isDeleteAbsenceOpen}
                                    isLoadingWhileDeleting={
                                        isLoadingWhileDeleting
                                    }
                                    canManageAbsence={isManagementRole(
                                        viewerRole,
                                    )}
                                    showMexicoReferenceNotice={
                                        showMexicoReferenceNotice
                                    }
                                    calendarTimeZone={calendarTimeZone}
                                    onOpenEvidence={openAbsenceEvidence}
                                    onStartEdit={startAbsenceEdit}
                                    onCancelEdit={cancelAbsenceEdit}
                                    onSubmitEdit={submitAbsenceEdit}
                                    onOpenDelete={openDeleteAbsence}
                                    onCancelDelete={cancelDeleteAbsence}
                                    onConfirmDelete={confirmDeleteAbsence}
                                    onAbsenceFieldChange={setAbsenceField}
                                    onAbsenceEvidenceChange={
                                        handleAbsenceEvidenceChange
                                    }
                                />
                            ) : (
                                <WorkerAbsenceDetail
                                    event={selectedEvent}
                                    evidenceLabel={absenceEvidenceLabel}
                                    showMexicoReferenceNotice={
                                        showMexicoReferenceNotice
                                    }
                                    calendarTimeZone={calendarTimeZone}
                                    onOpenEvidence={openAbsenceEvidence}
                                />
                            );

                        case "vacaciones":
                            return isManagementRole(viewerRole) ? (
                                <VacationDetail
                                    event={selectedEvent}
                                    isEditing={isVacationEditing}
                                    vacationForm={vacationForm}
                                    vacationEditError={vacationEditError}
                                    vacationRemainingInfo={vacationRemainingInfo}
                                    vacationDateRules={vacationDateRules}
                                    isLoadingVacationRemaining={isLoadingVacationRemaining}
                                    isSaving={isSavingVacation}
                                    onEdit={startVacationEdit}
                                    onCancelEdit={cancelVacationEdit}
                                    onSubmitEdit={submitVacationEdit}
                                    onVacationFieldChange={setVacationField}
                                    onDelete={openDeleteVacation}
                                    onApprove={openApproveVacation}
                                    onReject={openRejectVacation}
                                    showMexicoReferenceNotice={
                                        showMexicoReferenceNotice
                                    }
                                    calendarTimeZone={calendarTimeZone}
                                />
                            ) : (
                                <VacationWorkerDetail
                                    event={selectedEvent}
                                    isEditing={isVacationEditing}
                                    vacationForm={vacationForm}
                                    vacationEditError={vacationEditError}
                                    vacationRemainingInfo={vacationRemainingInfo}
                                    vacationDateRules={vacationDateRules}
                                    isLoadingVacationRemaining={isLoadingVacationRemaining}
                                    isSaving={isSavingVacation}
                                    onEdit={startVacationEdit}
                                    onCancelEdit={cancelVacationEdit}
                                    onSubmitEdit={submitVacationEdit}
                                    onVacationFieldChange={setVacationField}
                                    onDelete={openDeleteVacation}
                                    showMexicoReferenceNotice={
                                        showMexicoReferenceNotice
                                    }
                                    calendarTimeZone={calendarTimeZone}
                                />
                            );

                        default: {
                            const scope = selectedEvent?.scope;
                            const isPersonal = scope === "personal";
                            const isHouse = scope === "house";

                            return (
                                <EventDetail
                                    event={selectedEvent}
                                    onEdit={openEventEdit}
                                    onDelete={openEventDelete}
                                    isDeleteOpen={
                                        isPersonal ? isDeletePersonalEventOpen
                                        : isHouse   ? isDeleteHouseEventOpen
                                        : false
                                    }
                                    onCancelDelete={
                                        isPersonal ? cancelDeletePersonalEvent
                                        : isHouse   ? cancelDeleteHouseEvent
                                        : undefined
                                    }
                                    onConfirmDelete={
                                        isPersonal ? confirmDeletePersonalEvent
                                        : isHouse   ? confirmDeleteHouseEvent
                                        : undefined
                                    }
                                    isDeleting={
                                        isPersonal ? isDeletingPersonalEvent
                                        : isHouse   ? isDeletingHouseEvent
                                        : false
                                    }
                                    deleteError={
                                        isPersonal ? deletePersonalEventError
                                        : isHouse   ? deleteHouseEventError
                                        : ""
                                    }
                                    viewerRole={viewerRole}
                                    calendarTimeZone={calendarTimeZone}
                                    showMexicoReferenceNotice={
                                        showMexicoReferenceNotice
                                    }
                                />
                            );
                        }
                    }
                })()}
            </Modal>

            <ConfirmDeleteVacationModal
                event={isDeleteVacationOpen ? selectedEvent : null}
                loading={isDeletingVacation}
                error={deleteVacationError}
                showEmployeeInfo={isManagementRole(viewerRole)}
                onCancel={cancelDeleteVacation}
                onConfirm={confirmDeleteVacation}
            />

            <ConfirmApproveVacationModal
                request={approveVacationRequestModal}
                loading={isApprovingVacation}
                error={approveVacationError}
                onCancel={cancelApproveVacation}
                onConfirm={confirmApproveVacation}
            />

            <ConfirmRejectVacationModal
                request={rejectVacationRequestModal}
                loading={isRejectingVacation}
                error={rejectVacationError}
                onCancel={cancelRejectVacation}
                onConfirm={confirmRejectVacation}
            />

            <UpdateHouseEventModal
                event={editingHouseEvent}
                isOpen={editingHouseEvent != null}
                onClose={() => setEditingHouseEvent(null)}
                onSuccess={onHouseEventEditSuccess}
                calendarTimeZone={calendarTimeZone}
            />

            <UpdatePersonalEventModal
                event={editingPersonalEvent}
                isOpen={editingPersonalEvent != null}
                onClose={() => setEditingPersonalEvent(null)}
                onSuccess={onPersonalEventEditSuccess}
                calendarTimeZone={calendarTimeZone}
                calendarTimeZoneMode={calendarTimeZoneMode}
                canSwitchCalendarTimeZone={canSwitchCalendarTimeZone}
            />

            <RegisterEventModal
                isOpen={selectedDates != null}
                onClose={() => closeCreationModal(calendarRef)}
                onSuccess={() => {
                    closeCreationModal(calendarRef);
                    reloadCurrentRange();
                    setAlert({
                        type: "success",
                        message: "Evento creado exitosamente",
                    });
                }}
                onFeedback={showCalendarAlert}
                initialStartDate={selectedDates?.startDate}
                initialEndDate={selectedDates?.endDate}
                initialStartTime={selectedDates?.startTime}
                initialEndTime={selectedDates?.endTime}
                initialAllDay={selectedDates?.allDay}
                calendarTimeZone={calendarTimeZone}
                calendarTimeZoneMode={calendarTimeZoneMode}
                canSwitchCalendarTimeZone={canSwitchCalendarTimeZone}
            />
        </div>
    );
};

export default Calendario;
