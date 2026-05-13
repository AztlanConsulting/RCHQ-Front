import React, { useCallback, useEffect, useState } from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import CalendarFilters from "../components/molecules/calendarFilters";
import Modal from "../components/atoms/modal";
import EventDetail from "../components/molecules/calendarCards/eventDetail";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../hooks/organism/useCalendarFilters";
import { eventApiToDetail } from "../utils/calendarEventDetail";

import { normalToUTCWithOffset } from "../utils/dates";

const Calendario = () => {
  const calendarRef = React.useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDates, setSelectedDates] = useState(null);

  const {
    employeeHouseName,
    allEvents,
    handleDatesSet,
    loadButtonsAtStart,
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
    focusFilters,
    setFocusFilters,
    focusOptions,
    scopeFilters,
    setScopeFilters,
    scopeOptions,
    eventTypeFilters,
    setEventTypeFilters,
    eventTypeOptions,
    showEventFilters,
    showVacationFilters,
    showAbscenceFilters,
    visibleEvents,
  } = useCalendarFilters(allEvents);

  const closeDetail = useCallback(() => setSelectedEvent(null), []);
  const closeCreationModal = useCallback(() => setSelectedDates(null), []);

  const handleEventClick = useCallback((info) => {
    const detail = eventApiToDetail(info?.event);
    setSelectedEvent(detail);
  }, []);

  const handleDateDrags = useCallback((info) => {
    const startDate = normalToUTCWithOffset(info.start);
    const endDate = normalToUTCWithOffset(info.end, { minutes: -1 });

    const detail = `De ${startDate.getUTCFullYear()}-${startDate.getUTCMonth() + 1}-${startDate.getUTCDate()} a ${endDate.getUTCFullYear()}-${endDate.getUTCMonth() + 1}-${endDate.getUTCDate()}`;

    setSelectedDates(detail);
  }, []);

  useEffect(() => {
    setOwnCalendar();
  }, []);

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
        showEventFilters={showEventFilters}
        showVacationFilters={showVacationFilters}
        showAbscenceFilters={showAbscenceFilters}
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
        />
      </div>

      <Modal
        open={selectedEvent != null}
        onClose={closeDetail}
        title="Detalle del evento"
        grayBackground={false}
        placement="right"
        className="max-w-[25vw] max-h-[80vh]"
      >
        <EventDetail event={selectedEvent} />
      </Modal>

      <Modal
        open={selectedDates != null}
        onClose={closeCreationModal}
        title="Creación de evento"
        grayBackground={false}
        placement="center"
        className="max-w-[25vw] max-h-[80vh]"
      >
        <p>{selectedDates}</p>
      </Modal>
    </div>
  );
};

export default Calendario;
