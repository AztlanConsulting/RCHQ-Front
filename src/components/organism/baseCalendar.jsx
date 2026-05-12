import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useEffect } from "react";

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
    visibleEvents,
    handleDatesSet,
}) => {
    useEffect(() => { 
        loadButtonsAtStart();
        resizeHandler(calendarRef);
    });

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
            height="calc(100vh - 40px)"
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
            events={visibleEvents}
            datesSet={handleDatesSet}
        />
    );
};

export default BaseCalendar;
