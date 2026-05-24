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
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../hooks/organism/useCalendarFilters";
import { useCalendarPage } from "../hooks/pages/useCalendarPage";

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
        employeeFilters,
        filteredEmployeeOptions,
        employeeSearch,
        selectedEmployeeLabel,
        setEmployeeSearch,
        toggleEmployeeValue,
        clearEmployeeSelection,
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
    } = useCalendarFilters(allEvents, { isList, viewerRole, calendarMode });

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
        isLoadingVacationRemaining,
        isDeleteVacationOpen,
        isDeletingVacation,
        deleteVacationError,
        openDeleteVacation,
        cancelDeleteVacation,
        confirmDeleteVacation,
    } = useCalendarPage({
        absenceTypeOptions,
        reloadCurrentRange,
        viewerRole,
    });

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
        employeeFilters,
        filteredEmployeeOptions,
        employeeSearch,
        selectedEmployeeLabel,
        setEmployeeSearch,
        toggleEmployeeValue,
        clearEmployeeSelection,
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
                    key={`${viewType}-${isList}`}
                    initialView={currentCalendarView}
                    initialDate={currentCalendarDate}
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
                className={() => {
                    if (
                        ["ausencias", "vacaciones"].includes(
                            selectedEvent?.focus,
                        )
                    )
                        return "w-[92vw] max-w-[32rem] sm:max-w-[34rem] lg:max-w-[32rem] max-h-[80vh]";

                    return "max-w-[25vw] max-h-[80vh]";
                }}
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
                                    isSaving={isSavingAbsence}
                                    isDeleteOpen={isDeleteAbsenceOpen}
                                    isLoadingWhileDeleting={
                                        isLoadingWhileDeleting
                                    }
                                    canManageAbsence={isManagementRole(
                                        viewerRole,
                                    )}
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
                                    onOpenEvidence={openAbsenceEvidence}
                                    onClose={closeDetail}
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
                                    isLoadingVacationRemaining={isLoadingVacationRemaining}
                                    isSaving={isSavingVacation}
                                    onEdit={startVacationEdit}
                                    onCancelEdit={cancelVacationEdit}
                                    onSubmitEdit={submitVacationEdit}
                                    onVacationFieldChange={setVacationField}
                                    onDelete={openDeleteVacation}
                                    onApprove={() => { }}
                                    onReject={() => { }}
                                />
                            ) : (
                                <VacationWorkerDetail
                                    event={selectedEvent}
                                    isEditing={isVacationEditing}
                                    vacationForm={vacationForm}
                                    vacationEditError={vacationEditError}
                                    vacationRemainingInfo={vacationRemainingInfo}
                                    isLoadingVacationRemaining={isLoadingVacationRemaining}
                                    isSaving={isSavingVacation}
                                    onClose={closeDetail}
                                    onEdit={startVacationEdit}
                                    onCancelEdit={cancelVacationEdit}
                                    onSubmitEdit={submitVacationEdit}
                                    onVacationFieldChange={setVacationField}
                                    onDelete={() => {}}
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
                onCancel={cancelDeleteVacation}
                onConfirm={confirmDeleteVacation}
            />

            <UpdateHouseEventModal
                event={editingHouseEvent}
                isOpen={editingHouseEvent != null}
                onClose={() => setEditingHouseEvent(null)}
                onSuccess={onHouseEventEditSuccess}
            />

            <UpdatePersonalEventModal
                event={editingPersonalEvent}
                isOpen={editingPersonalEvent != null}
                onClose={() => setEditingPersonalEvent(null)}
                onSuccess={onPersonalEventEditSuccess}
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
                initialStartDate={
                    selectedDates?.startDate?.toISOString().split("T")[0]
                }
                initialEndDate={
                    selectedDates?.endDate?.toISOString().split("T")[0]
                }
            />
        </div>
    );
};

export default Calendario;
