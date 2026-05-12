import React, { useEffect } from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";

const Calendario = () => {
    const calendarRef = React.useRef(null);
    const {
        setViewEmployeeId,
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
        <div>
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