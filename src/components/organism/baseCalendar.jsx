import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useCallback, useEffect } from "react";
import DayGridCard from "../molecules/calendarCards/dayGridCard";
import DayGridOverflowCard from "../molecules/calendarCards/dayGridOverflowCard";
import WeekTimeCard from "../molecules/calendarCards/weekTimeCard";
import DayTimeCard from "../molecules/calendarCards/dayTimeCard";
import ListEventCard from "../molecules/calendarCards/listEventCard";

const MONTH_DAY_EVENT_CAP = 3;

const renderEventContent = (arg) => {
    const viewType = arg.view.type;

    if (viewType === "dayGridMonth") {
        return <DayGridCard arg={arg} />;
    }
    if (viewType === "timeGridWeek") {
        return <WeekTimeCard arg={arg} />;
    }
    if (viewType === "timeGridDay") {
        return <DayTimeCard arg={arg} />;
    }
    if (
        viewType === "listMonth" ||
        viewType === "listWeek" ||
        viewType === "listDay"
    ) {
        return <ListEventCard arg={arg} />;
    }

    return <DayGridCard arg={arg} />;
};

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
    onEventClick,
}) => {
    const eventContent = useCallback((arg) => renderEventContent(arg), []);

    const moreLinkContent = useCallback(
        (arg) => <DayGridOverflowCard count={arg.num} />,
        [],
    );

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
                    dayMaxEvents: MONTH_DAY_EVENT_CAP,
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
            eventContent={eventContent}
            moreLinkContent={moreLinkContent}
            eventClick={(info) => onEventClick?.(info)}
        />
    );
};

export default BaseCalendar;
