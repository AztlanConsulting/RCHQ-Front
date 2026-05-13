import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useEffect } from "react";

import { normalToUTCWithOffset } from "../../utils/dates";

const BaseCalendar = ({
    loadButtonsAtStart,
    calendarRef,
    toggleList,
    setMonthView,
    setWeekView,
    setDayView,
    generateTitle,
    getWeekDayName,
    resizeHandler,
    fetchEventsInRange,
}) => {
    useEffect(() => {
        loadButtonsAtStart();
        resizeHandler(calendarRef);
    });

    const dateClicked = (info) => {
        const realStartDate = normalToUTCWithOffset(info.date);

        const realEndDate = normalToUTCWithOffset(info.date, { days: 1, minutes: -1 });

        alert(
            "Start on " +
                realStartDate.toISOString() +
                "and ends on " +
                realEndDate.toISOString(),
        );
    };

    const finalDrag = (info) => {
        const realStartDate = normalToUTCWithOffset(info.start);

        const realEndDate = normalToUTCWithOffset(info.end, { minutes: -1 });

        alert(
            "Start on " +
                realStartDate.toISOString() +
                "and ends on " +
                realEndDate.toISOString(),
        );
    };

    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[
                dayGridPlugin,
                interactionPlugin,
                timeGridPlugin,
                listPlugin,
            ]}
            locales={[esLocale]}
            locale="es"
            windowResizeDelay="10"
            height="calc(100vh - 80px)"
            headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "toggleListButton monthButton,weekButton,dayButton",
            }}
            titleFormat={(arg) => generateTitle(arg)}
            views={{
                timeGridDay: {
                    dayHeaderContent: (arg) => getWeekDayName(arg),
                },
                timeGridWeek: {
                    dayHeaderContent: (arg) => getWeekDayName(arg),
                },
                dayGridMonth: {
                    dayHeaderContent: (arg) => getWeekDayName(arg),
                },
            }}
            windowResize={() => resizeHandler(calendarRef)}
            customButtons={{
                toggleListButton: {
                    text: "Lista",
                    click: () => toggleList(calendarRef),
                },
                monthButton: {
                    text: "Mes",
                    click: () => setMonthView(calendarRef),
                },
                weekButton: {
                    text: "Semana",
                    click: () => setWeekView(calendarRef),
                },
                dayButton: {
                    text: "Día",
                    click: () => setDayView(calendarRef),
                },
            }}
            events={(info, successCallback, failureCallback) =>
                fetchEventsInRange(info, successCallback, failureCallback)
            }
            dateClick={(info) => dateClicked(info)}
            selectable={true}
            select={(info) => finalDrag(info)}
        />
    );
};

export default BaseCalendar;
