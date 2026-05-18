import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useCallback, useEffect, useMemo } from "react";
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
    initialView,
    loadButtonsAtStart,
    calendarRef,
    toggleList,
    setMonthView,
    setWeekView,
    setDayView,
    openCreationModal,
    generateTitle,
    getWeekDayName,
    resizeHandler,
    visibleEvents,
    handleDatesSet,
    onEventClick,
    onDateDrag,
    onDateDragging,
    onOpenCalendarFilters,
}) => {
    const eventContent = useCallback((arg) => renderEventContent(arg), []);

    const moreLinkContent = useCallback(
        (arg) => <DayGridOverflowCard count={arg.num} />,
        [],
    );

    const customButtons = useMemo(
        () => ({
            toggleListButton: {
                text: "",
                icon: "list",
                hint: "Lista",
                click: () => toggleList(calendarRef),
            },
            createEventButton: {
                text: "",
                hint: "Crear evento",
                click: () => openCreationModal?.(calendarRef),
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
            ...(onOpenCalendarFilters
                ? {
                      calendarFiltersButton: {
                          icon: "calendar-filter",
                          hint: "Filtros del calendario",
                          click: () => onOpenCalendarFilters(),
                      },
                  }
                : {}),
        }),
        [
            calendarRef,
            toggleList,
            openCreationModal,
            setMonthView,
            setWeekView,
            setDayView,
            onOpenCalendarFilters,
        ],
    );

    const headerToolbar = useMemo(
        () => ({
            left: onOpenCalendarFilters
                ? "prev,next today calendarFiltersButton createEventButton"
                : "prev,next today createEventButton",
            center: "title",
            right: "toggleListButton monthButton,weekButton,dayButton",
        }),
        [onOpenCalendarFilters],
    );

    useEffect(() => {
        loadButtonsAtStart();
        resizeHandler(calendarRef);
    });

    return (
        <FullCalendar
            ref={calendarRef}
            initialView={initialView}
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
            headerToolbar={headerToolbar}
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
            customButtons={customButtons}
            events={visibleEvents}
            datesSet={handleDatesSet}
            eventContent={eventContent}
            moreLinkContent={moreLinkContent}
            eventClick={(info) => onEventClick?.(info)}
            selectable={true}
            select={(info) => onDateDrag?.(info, calendarRef)}
            selectAllow={() => onDateDragging?.()}
            unselectAuto={false}
        />
    );
};

export default BaseCalendar;
