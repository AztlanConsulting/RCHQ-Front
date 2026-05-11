import React, { useEffect } from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";
import CalendarFilters from "../components/molecules/calendarFilters";

const Calendario = () => {
    const calendarRef = React.useRef(null);
    const {
        setViewEmployeeId,
        employeeHouseName,
        scopeFilters,
        setScopeFilters,
        typeFilters,
        setTypeFilters,
        loadButtonsAtStart,
        toggleList,
        setMonthView,
        setWeekView,
        setDayView,
        generateTitle,
        getWeekDayName,
        resizeHandler,
        fetchEventsInRange,
        setOwnCalendar
    } = useBaseCalendar();

    useEffect(() => {
        setOwnCalendar();
    }, []);

    return (
        <div className="flex">
            <CalendarFilters 
                className="basis-1/6"
                houseName={employeeHouseName}
                scopeFilters={scopeFilters}
                setScopeFilters={setScopeFilters}
                typeFilters={typeFilters}
                setTypeFilters={setTypeFilters}
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
                fetchEventsInRange={fetchEventsInRange}
            />
        </div>
    );
};

export default Calendario;