import { useCallback, useMemo, useRef, useState } from "react";
import {
    getCalendarViewerRole,
    getEmployeeHouseName,
    getEventsInRange,
    getHouseEventsInRange,
    getOwnEmployeeId,
} from "../../services/calendarService";
import { normalToUTCWithOffset } from "../../utils/dates";

export const useBaseCalendar = () => {
    const [isList, setIsList] = useState(false);
    const [viewType, setViewType] = useState("Month");
    const [viewEmployeeId, setViewEmployeeId] = useState("");
    const [viewerRole, setViewerRole] = useState("");
    const [calendarMode, setCalendarMode] = useState("personal");
    const [employeeHouseName, setEmployeeHouseName] = useState("");
    const [allEvents, setAllEvents] = useState([]);
    const [selectedDates, setSelectedDates] = useState(null);
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
        role === "Admin" || role === "Coordinador";

    const isCoordinator = useMemo(
        () => effectiveViewerRole === "Coordinador",
        [effectiveViewerRole],
    );

    const canSwitchCalendarMode = useMemo(
        () => canViewHouseEvents(effectiveViewerRole),
        [effectiveViewerRole],
    );

    const calendarModeOptions = useMemo(
        () => [
            { value: "personal", label: "Mi calendario" },
            { value: "house", label: "Calendario de la casa" },
        ],
        [],
    );

    const filteredCalendarEvents = useMemo(() => {
        if (isCoordinator) {
            if (calendarMode === "personal") {
                return allEvents.filter(
                    (event) =>
                        (event.focus === "ausencias" &&
                            String(event.employeeId) ===
                                String(effectiveEmployeeId)) ||
                        (event.focus === "vacaciones" &&
                            String(event.employeeId) ===
                                String(effectiveEmployeeId)) ||
                        (event.focus === "eventos" &&
                            (event.scope === "house" ||
                                event.scope === "global")) ||
                        (event.scope === "personal" &&
                            String(event.employeeId) ===
                                String(effectiveEmployeeId)),
                );
            }

            return allEvents;
        }

        if (!canSwitchCalendarMode || calendarMode === "personal") {
            return allEvents.filter(
                (event) =>
                    !(event.focus === "ausencias" && event.scope === "house"),
            );
        }

        return allEvents;
    }, [
        allEvents,
        calendarMode,
        canSwitchCalendarMode,
        effectiveEmployeeId,
        isCoordinator,
    ]);

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
        const shortenedMonths = [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sept",
            "Oct",
            "Nov",
            "Dic",
        ];
        const fullMonths = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ];
        const monthText = isComplete
            ? fullMonths[monthNumber]
            : shortenedMonths[monthNumber];

        return monthText;
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

        const startDay = currentStatus.start.day;
        const startMonthNumber = currentStatus.start.month;
        const isFullStartMonthName = false;
        const startMonth = getMonth(startMonthNumber, isFullStartMonthName);
        const startYear = currentStatus.start.year;

        const endDay = currentStatus.end.day;
        const endMonthNumber = currentStatus.end.month;
        const isFullEndMonthName = viewType == "Day";
        const endMonth = getMonth(endMonthNumber, isFullEndMonthName);
        const endYear = currentStatus.end.year;

        const startMonthText = startMonth != endMonth ? ` ${startMonth}` : "";
        const startYearText = startYear != endYear ? ` ${startYear}` : "";
        const startText =
            viewType == "Week"
                ? `${startDay}${startMonthText}${startYearText} - `
                : "";
        const title = `${startText}${endDay} ${endMonth} ${endYear}`;

        return title;
    };

    const getDayWidth = () => {
        const tableCell = document.querySelector(".fc-day");
        if (!tableCell) return 0;

        const cellWidth = tableCell.clientWidth || 0;

        return cellWidth;
    };

    const validateShortenedSize = () => {
        if (viewType == "Day") return false;

        const currentDayWidth = getDayWidth();

        if (currentDayWidth < 96) return true;

        return false;
    };

    const getWeekDayName = (currentDay) => {
        const weekDayIndex = currentDay.dow;
        const shortenedDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const fullDays = [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
        ];
        const weekDay = validateShortenedSize()
            ? shortenedDays[weekDayIndex]
            : fullDays[weekDayIndex];
        return weekDay;
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
        const rawEvents = await loadCalendarEvents(
            start.split("T")[0],
            end.split("T")[0],
            effectiveEmployeeId,
            effectiveViewerRole,
        );

        setAllEvents(rawEvents ?? []);
        return rawEvents ?? [];
    }, [effectiveEmployeeId, effectiveViewerRole, loadCalendarEvents]);

    const handleDatesSet = async (dateInfo) => {
        const { startStr, endStr } = dateInfo;
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
            const rawEvents = await loadCalendarEvents(
                startStr.split("T")[0],
                endStr.split("T")[0],
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
        const startDate = normalToUTCWithOffset(info.start);
        const endDate = normalToUTCWithOffset(info.end, { seconds: -1 });

        setSelectedDates({ startDate, endDate });

        const calendarApi = calendarRef.current.getApi();
        calendarApi.selectable = false;
    }, []);

    const handleDateDragging = () => {
        setSelectedDates(null);
        return true;
    };

    return {
        employeeHouseName,
        allEvents: filteredCalendarEvents,
        isList,
        viewType,
        viewerRole,
        calendarMode,
        setCalendarMode,
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
    };
};
