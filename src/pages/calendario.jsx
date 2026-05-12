import React, { useEffect } from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import CalendarFilters from "../components/molecules/calendarFilters";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../hooks/organism/useCalendarFilters";

const Calendario = () => {
    const calendarRef = React.useRef(null);

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
        focusFilters, setFocusFilters, focusOptions,
        scopeFilters,   setScopeFilters,   scopeOptions,
        eventTypeFilters, setEventTypeFilters, eventTypeOptions,
        showEventFilters, showVacationFilters, showAbscenceFilters,
        visibleEvents,
    } = useCalendarFilters(allEvents);

    useEffect(() => {
        setOwnCalendar();
    }, []);

    return (
        <div className="flex">
            <CalendarFilters
                className="basis-1/6 min-w-40"
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
            />
        </div>
    );
};

export default Calendario;
