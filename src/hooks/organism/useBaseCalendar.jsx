import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    getCalendarViewerRole,
    getEmployeeHouseName,
    getEventsInRange,
    getHouseEventsInRange,
    getOwnEmployeeId,
} from "../../services/calendarService";
import {
    addDaysToInputValue,
    dateStringToInputValue,
    timeStringToInputValue,
} from "../../utils/dates";
import {
    getBrowserTimeZone,
    getCalendarNowValue,
    MEXICO_TIME_ZONE,
} from "../../utils/timeZone";

const SHORT_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
const FULL_MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const SHORT_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const FULL_DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const getPaddedFetchRange = (startValue, endValue) => {
    const startDate = String(startValue ?? "").split("T")[0];
    const endDate = String(endValue ?? "").split("T")[0];

    return {
        startDate: addDaysToInputValue(startDate, -1) || startDate,
        endDate: addDaysToInputValue(endDate, 1) || endDate,
    };
};

export const useBaseCalendar = () => {
    const [isList, setIsList] = useState(false);
    const [viewType, setViewType] = useState("Month");
    const [viewEmployeeId, setViewEmployeeId] = useState("");
    const [viewerRole, setViewerRole] = useState("");
    const [calendarMode, setCalendarMode] = useState("personal");
    const [calendarTimeZoneMode, setCalendarTimeZoneMode] = useState("local");
    const [employeeHouseName, setEmployeeHouseName] = useState("");
    const [allEvents, setAllEvents] = useState([]);
    const [selectedDates, setSelectedDates] = useState(null);
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const [calendarClock, setCalendarClock] = useState(() => new Date());
    const lastFetchedRange = useRef(null);

    const effectiveEmployeeId = useMemo(
        () => viewEmployeeId || getOwnEmployeeId(),
        [viewEmployeeId],
    );
    const effectiveViewerRole = useMemo(
        () => viewerRole || getCalendarViewerRole(),
        [viewerRole],
    );

    const canViewHouseEvents = (role) =>
        role === "Administrador" || role === "Coordinador";

    const canSwitchCalendarMode = useMemo(
        () => canViewHouseEvents(effectiveViewerRole),
        [effectiveViewerRole],
    );
    const browserTimeZone = useMemo(() => getBrowserTimeZone(), []);
    const canSwitchCalendarTimeZone = browserTimeZone !== MEXICO_TIME_ZONE;
    const calendarTimeZone = useMemo(
        () =>
            calendarTimeZoneMode === "mexico"
                ? MEXICO_TIME_ZONE
                : browserTimeZone,
        [browserTimeZone, calendarTimeZoneMode],
    );
    const calendarNow = useMemo(
        () => getCalendarNowValue(calendarTimeZone, calendarClock),
        [calendarTimeZone, calendarClock],
    );
    const fullCalendarTimeZone = calendarTimeZone;
    const calendarTimeZoneOptions = useMemo(
        () => [
            { value: "local", label: "Horario local" },
            { value: "mexico", label: "Horario central de México" },
        ],
        [],
    );

    const calendarModeOptions = useMemo(
        () => [
            { value: "personal", label: "Mi calendario" },
            { value: "house", label: "Calendario de la casa" },
        ],
        [],
    );

    const filteredCalendarEvents = useMemo(() => {
        if (calendarMode === "personal") {
            return allEvents.filter(
                (event) =>
                    (event.focus === "ausencias" &&
                        String(event.employeeId) ==
                            String(effectiveEmployeeId)) ||
                    (event.focus === "vacaciones" &&
                        String(event.employeeId) ===
                            String(effectiveEmployeeId)) ||
                    (event.focus === "eventos" &&
                        (event.scope === "house" ||
                            event.scope === "global")) ||
                    (event.scope === "personal" &&
                        event.peopleInsideEvent &&
                        event.peopleInsideEvent.some(
                            (person) =>
                                String(person.id) ===
                                String(effectiveEmployeeId),
                        )),
            );
        }

        return allEvents;
    }, [allEvents, calendarMode, effectiveEmployeeId]);

    const getCorrespondingView = (isList, viewType) => {
        let newView;

        if (viewType == "Month") {
            newView = isList ? "listMonth" : "dayGridMonth";
        } else if (viewType == "Week") {
            newView = isList ? "listWeek" : "timeGridWeek";
        } else {
            newView = isList ? "listDay" : "timeGridDay";
        }

        return newView;
    };

    const updateView = (calendarRef, newView) => {
        const calendarApi = calendarRef.current.getApi();

        if (calendarApi.view.type == newView) return;

        setSelectedDates(null);

        calendarApi.changeView(newView);
        updateButtons(newView);
    };

    const loadButtonsAtStart = () => {
        const currentView = getCorrespondingView(isList, viewType);
        updateButtons(currentView);
    };

    const updateButtons = (currentView) => {
        document.querySelectorAll(".fc-button").forEach((btn) => {
            btn.classList.remove("active-btn");
        });

        if (currentView.includes("Month")) {
            document
                .querySelector(".fc-monthButton-button")
                ?.classList.add("active-btn");
        }
        if (currentView.includes("Week")) {
            document
                .querySelector(".fc-weekButton-button")
                ?.classList.add("active-btn");
        }
        if (currentView.includes("Day")) {
            document
                .querySelector(".fc-dayButton-button")
                ?.classList.add("active-btn");
        }
        if (currentView.includes("list")) {
            document
                .querySelector(".fc-toggleListButton-button")
                ?.classList.add("active-btn");
        }
    };

    const toggleList = (calendarRef) => {
        const newState = !isList;
        setIsList(newState);

        const newView = getCorrespondingView(newState, viewType);

        updateView(calendarRef, newView);
    };

    const setMonthView = (calendarRef) => {
        setViewType("Month");

        const newView = getCorrespondingView(isList, "Month");

        updateView(calendarRef, newView);
    };

    const setWeekView = (calendarRef) => {
        setViewType("Week");

        const newView = getCorrespondingView(isList, "Week");

        updateView(calendarRef, newView);
    };

    const setDayView = (calendarRef) => {
        setViewType("Day");

        const newView = getCorrespondingView(isList, "Day");

        updateView(calendarRef, newView);
    };

    const getMonth = (monthNumber, isComplete) => {
        return isComplete ? FULL_MONTHS[monthNumber] : SHORT_MONTHS[monthNumber];
    };

    const generateTitle = (currentStatus) => {
        if (viewType == "Month") {
            const monthNumber = currentStatus.date.array[1];
            const isFullMonthName = true;
            const month = getMonth(monthNumber, isFullMonthName);
            const year = currentStatus.date.array[0];
            const title = `${month} de ${year}`;

            return title;
        }

        const isDay = viewType == "Day";

        const startDay = currentStatus.start.day;
        const startMonthNumber = currentStatus.start.month;
        const isFullStartMonthName = false;
        const startMonth = getMonth(startMonthNumber, isFullStartMonthName);
        const startYear = currentStatus.start.year;

        const endDay = currentStatus.end.day;
        const endMonthNumber = currentStatus.end.month;
        const endMonth = getMonth(endMonthNumber, isDay);
        const endYear = currentStatus.end.year;

        const monthDescriber = isDay ? " de" : "";

        const startMonthText = startMonth != endMonth ? ` ${startMonth}` : "";
        const startYearText = startYear != endYear ? ` ${startYear}` : "";
        const startText =
            viewType == "Week"
                ? `${startDay}${startMonthText}${startYearText} - `
                : "";
        const title = `${startText}${endDay}${monthDescriber} ${endMonth} ${endYear}`;

        return title;
    };

    const getDayWidth = () => {
        const tableCell = document.querySelector(".fc-day");
        if (!tableCell) return 0;

        const cellWidth = tableCell.clientWidth || 0;

        return cellWidth;
    };

    const validateShortenedSize = (hasNumber) => {
        if (viewType == "Day") return false;

        const currentDayWidth = getDayWidth();

        if (currentDayWidth < (hasNumber ? 106 : 96)) return true;

        return false;
    };

    const getWeekDayName = (currentDay) => {
        const weekDayIndex = currentDay.date.getDay();
        const hasNumber = viewType == "Week";

        const weekDay = validateShortenedSize(hasNumber)
            ? SHORT_DAYS[weekDayIndex]
            : FULL_DAYS[weekDayIndex];

        const dayNumber = hasNumber ? ` ${currentDay.date.getDate() + 1}` : "";

        return `${weekDay}${dayNumber}`;
    };

    const resizeHandler = (calendarRef) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.render();
    };

    const loadCalendarEvents = useCallback(
        async (startDate, endDate, employeeId, role) => {
            const personalEventsPromise = employeeId
                ? getEventsInRange(employeeId, startDate, endDate)
                : Promise.resolve([]);

            const sameHouseEventsPromise = canViewHouseEvents(role)
                ? getHouseEventsInRange(startDate, endDate)
                : Promise.resolve([]);

            const [personalEvents, houseEvents] = await Promise.all([
                personalEventsPromise,
                sameHouseEventsPromise,
            ]);

            return [...(personalEvents ?? []), ...(houseEvents ?? [])];
        },
        [],
    );

    const reloadCurrentRange = useCallback(async () => {
        if (!lastFetchedRange.current) return [];
        if (
            effectiveEmployeeId == "" &&
            !canViewHouseEvents(effectiveViewerRole)
        )
            return [];

        const { start, end } = lastFetchedRange.current;
        const fetchRange = getPaddedFetchRange(start, end);
        const rawEvents = await loadCalendarEvents(
            fetchRange.startDate,
            fetchRange.endDate,
            effectiveEmployeeId,
            effectiveViewerRole,
        );

        setAllEvents(rawEvents ?? []);
        return rawEvents ?? [];
    }, [effectiveEmployeeId, effectiveViewerRole, loadCalendarEvents]);

    const reloadVisibleRange = useCallback(
        async (calendarRef) => {
            const calendarApi = calendarRef.current?.getApi?.();
            const currentView = calendarApi?.view;

            if (!currentView) return [];
            if (
                effectiveEmployeeId == "" &&
                !canViewHouseEvents(effectiveViewerRole)
            )
                return [];

            const start = currentView.activeStart.toISOString();
            const end = currentView.activeEnd.toISOString();

            lastFetchedRange.current = { start, end };
            const fetchRange = getPaddedFetchRange(start, end);

            const rawEvents = await loadCalendarEvents(
                fetchRange.startDate,
                fetchRange.endDate,
                effectiveEmployeeId,
                effectiveViewerRole,
            );

            setAllEvents(rawEvents ?? []);
            return rawEvents ?? [];
        },
        [effectiveEmployeeId, effectiveViewerRole, loadCalendarEvents],
    );

    useEffect(() => {
        reloadCurrentRange().catch((err) => {
            console.error(err);
        });
    }, [reloadCurrentRange]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setCalendarClock(new Date());
        }, 60000);

        return () => window.clearInterval(intervalId);
    }, []);

    const handleDatesSet = async (dateInfo) => {
        const { startStr, endStr } = dateInfo;
        const currentDate = dateInfo.view.calendar.getDate();
        setCurrentCalendarDate((previousDate) =>
            previousDate?.getTime?.() === currentDate.getTime()
                ? previousDate
                : currentDate,
        );

        if (
            lastFetchedRange.current?.start === startStr &&
            lastFetchedRange.current?.end === endStr
        )
            return;
        lastFetchedRange.current = { start: startStr, end: endStr };

        if (
            effectiveEmployeeId == "" &&
            !canViewHouseEvents(effectiveViewerRole)
        )
            return;

        try {
            const fetchRange = getPaddedFetchRange(startStr, endStr);
            const rawEvents = await loadCalendarEvents(
                fetchRange.startDate,
                fetchRange.endDate,
                effectiveEmployeeId,
                effectiveViewerRole,
            );
            setAllEvents(rawEvents ?? []);
        } catch (err) {
            console.error(err);
        }
    };

    const setOwnCalendar = useCallback(async () => {
        const ownId = getOwnEmployeeId();
        const role = getCalendarViewerRole();
        setViewEmployeeId(ownId);
        setViewerRole(role);
        setCalendarMode("personal");
        const employeeHouseName = await getEmployeeHouseName();
        setEmployeeHouseName(employeeHouseName);
    }, []);

    const closeCreationModal = useCallback((calendarRef) => {
        setSelectedDates(null);
        const calendarApi = calendarRef.current.getApi();
        calendarApi.unselect();
    }, []);

    const openCreationModal = useCallback((calendarRef) => {
        calendarRef.current.getApi().unselect();
        setSelectedDates({});
    }, []);

    const handleDateDrags = useCallback((info, calendarRef) => {
        const isAllDaySelection = info.allDay === true;
        const startDate = dateStringToInputValue(info.startStr, info.start);
        const rawEndDate = dateStringToInputValue(
            info.endStr,
            info.end ?? info.start,
        );
        const endDate = isAllDaySelection
            ? addDaysToInputValue(rawEndDate, -1)
            : rawEndDate;

        setSelectedDates({
            startDate,
            endDate,
            startTime: isAllDaySelection
                ? ""
                : timeStringToInputValue(info.startStr, info.start),
            endTime: isAllDaySelection
                ? ""
                : timeStringToInputValue(info.endStr, info.end),
            allDay: isAllDaySelection,
        });

        const calendarApi = calendarRef.current.getApi();
        calendarApi.selectable = false;
    }, []);

    const handleDateDragging = () => {
        setSelectedDates(null);
        return true;
    };

    const currentCalendarView = useMemo(
        () => getCorrespondingView(isList, viewType),
        [isList, viewType],
    );

    return {
        employeeHouseName,
        allEvents: filteredCalendarEvents,
        isList,
        viewType,
        currentCalendarView,
        currentCalendarDate,
        viewerRole,
        calendarMode,
        setCalendarMode,
        calendarTimeZone,
        calendarNow,
        calendarTimeZoneMode,
        setCalendarTimeZoneMode,
        calendarTimeZoneOptions,
        canSwitchCalendarTimeZone,
        fullCalendarTimeZone,
        calendarModeOptions,
        canSwitchCalendarMode,
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
        selectedDates,
        closeCreationModal,
        openCreationModal,
        handleDateDrags,
        handleDateDragging,
        reloadCurrentRange,
        reloadVisibleRange,
    };
};
