import React from "react";
import BaseCalendar from "../components/organism/baseCalendar";
import { useBaseCalendar } from "../hooks/organism/useBaseCalendar";

const Calendario = () => {
    const calendarRef = React.useRef(null);
    const {
        toggleList,
        setMonthView,
        setWeekView,
        setDayView,
        generateTitle,
        getWeekDayName,
        resizeHandler
    } = useBaseCalendar();

    return (
        <div>
            <BaseCalendar
                calendarRef={calendarRef}
                initialDate={"2026-04-25"}
                events={[
                    {
                        id: "1",
                        title: "Team Meeting",
                        start: "2026-05-02T10:00:00",
                        end: "2026-05-02T11:00:00",
                    },
                    {
                        id: "2",
                        title: "Lunch Break",
                        start: "2026-05-02T13:00:00",
                    },
                    {
                        id: "3",
                        title: "Project Deadline",
                        start: "2026-05-05",
                        allDay: true,
                    },
                ]}
                toggleList={toggleList}
                setMonthView={setMonthView}
                setWeekView={setWeekView}
                setDayView={setDayView}
                generateTitle={generateTitle}
                getWeekDayName={getWeekDayName}
                resizeHandler={resizeHandler}
            />
        </div>
    );
};

export default Calendario;