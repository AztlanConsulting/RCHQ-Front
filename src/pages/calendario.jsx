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
        enfoqueFilters, setEnfoqueFilters, enfoqueOptions,
        scopeFilters,   setScopeFilters,   scopeOptions,
        tipoEventoFilters, setTipoEventoFilters, tipoEventoOptions,
        showTipoEvento, showVacaciones, showAusencias,
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
                enfoqueFilters={enfoqueFilters}
                setEnfoqueFilters={setEnfoqueFilters}
                enfoqueOptions={enfoqueOptions}
                scopeFilters={scopeFilters}
                setScopeFilters={setScopeFilters}
                scopeOptions={scopeOptions}
                tipoEventoFilters={tipoEventoFilters}
                setTipoEventoFilters={setTipoEventoFilters}
                tipoEventoOptions={tipoEventoOptions}
                showTipoEvento={showTipoEvento}
                showVacaciones={showVacaciones}
                showAusencias={showAusencias}
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
