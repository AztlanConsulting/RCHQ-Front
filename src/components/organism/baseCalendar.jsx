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
import { widenTimeGridColumnEventHarness } from "@/utils/weekTimeGridHarnessWidth";

const MONTH_DAY_EVENT_CAP = 3;

/** Left axis for time grids: "12am", "1am", … "12pm", "1pm" (locale "es" omits meridiem by default). */
const formatTimeGridSlotLabel = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const h24 = date.getHours();
    const isAm = h24 < 12;
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}${isAm ? "am" : "pm"}`;
};

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

const FULL_CALENDAR_PLUGINS = [
    dayGridPlugin,
    interactionPlugin,
    timeGridPlugin,
    listPlugin,
];

const CALENDAR_LOCALES = [esLocale];

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
    }, [calendarRef, loadButtonsAtStart, resizeHandler]);

    const titleFormatFn = useCallback(
        (arg) => generateTitle(arg),
        [generateTitle],
    );

    const viewsConfig = useMemo(
        () => ({
            timeGridDay: {
                dayHeaderContent: (arg) => getWeekDayName(arg),
                slotLabelContent: (arg) =>
                    formatTimeGridSlotLabel(arg.date),
                slotMinTime: "08:00:00",
                slotMaxTime: "18:00:00",
                slotDuration: "00:30:00",
                slotLabelInterval: "01:00:00",
            },
            timeGridWeek: {
                dayHeaderContent: (arg) => getWeekDayName(arg),
                slotLabelContent: (arg) =>
                    formatTimeGridSlotLabel(arg.date),
                slotMinTime: "08:00:00",
                slotMaxTime: "18:00:00",
                slotDuration: "00:30:00",
                slotLabelInterval: "01:00:00",
            },
            dayGridMonth: {
                dayHeaderContent: (arg) => getWeekDayName(arg),
                dayMaxEvents: MONTH_DAY_EVENT_CAP,
            },
        }),
        [getWeekDayName],
    );

    const onWindowResize = useCallback(() => {
        resizeHandler(calendarRef);
    }, [calendarRef, resizeHandler]);

    const handleFcEventClick = useCallback(
        (info) => {
            onEventClick?.(info);
        },
        [onEventClick],
    );

    const handleSelect = useCallback(
        (info) => {
            onDateDrag?.(info, calendarRef);
        },
        [onDateDrag, calendarRef],
    );

    const handleSelectAllow = useCallback(() => {
        return onDateDragging?.();
    }, [onDateDragging]);

    const handleTimedEventDidMount = useCallback((info) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                widenTimeGridColumnEventHarness(info);
            });
        });
    }, []);

    return (
        <FullCalendar
            ref={calendarRef}
            initialView={initialView}
            plugins={FULL_CALENDAR_PLUGINS}
            locales={CALENDAR_LOCALES}
            locale="es"
            windowResizeDelay="10"
            height="calc(100vh - 40px)"
            headerToolbar={headerToolbar}
            titleFormat={titleFormatFn}
            views={viewsConfig}
            windowResize={onWindowResize}
            customButtons={customButtons}
            events={visibleEvents}
            datesSet={handleDatesSet}
            eventContent={eventContent}
            moreLinkContent={moreLinkContent}
            eventDidMount={handleTimedEventDidMount}
            eventClick={handleFcEventClick}
            selectable={true}
            select={handleSelect}
            selectAllow={handleSelectAllow}
            unselectAuto={false}
        />
    );
};

export default BaseCalendar;
