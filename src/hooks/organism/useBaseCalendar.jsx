import { useCallback, useMemo, useRef, useState } from "react";
import {
    getCalendarViewerRole,
    getEmployeeHouseName,
    getEventsInRange,
    getHouseAbsencesInRange,
    getOwnEmployeeId,
} from "../../services/calendarService";
import { normalToUTCWithOffset } from "../../utils/dates";

const getCorrespondingView = (isList, viewType) => {
    if (viewType == "Month") {
        return isList ? "listMonth" : "dayGridMonth";
    }
    if (viewType == "Week") {
        return isList ? "listWeek" : "timeGridWeek";
    }
    return isList ? "listDay" : "timeGridDay";
};

const getCalendarMonthName = (monthNumber, isComplete) => {
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
    return isComplete ? fullMonths[monthNumber] : shortenedMonths[monthNumber];
};

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

    const canViewHouseAbsences = (role) =>
        role === "Admin" || role === "Coordinador";

    const isCoordinator = useMemo(
        () => effectiveViewerRole === "Coordinador",
        [effectiveViewerRole],
    );

    const canSwitchCalendarMode = useMemo(
        () => canViewHouseAbsences(effectiveViewerRole),
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
                        event.focus === "ausencias" &&
                        String(event.employeeId) ===
                            String(effectiveEmployeeId),
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

        return allEvents.filter((event) => {
            if (event.focus === "ausencias") {
                return event.scope === "house";
            }

            if (event.focus === "eventos") {
                return event.scope === "house" || event.scope === "global";
            }

            return false;
        });
    }, [
        allEvents,
        calendarMode,
        canSwitchCalendarMode,
        effectiveEmployeeId,
        isCoordinator,
    ]);

    const updateButtons = useCallback((currentView) => {
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
    }, []);

    const updateView = useCallback((calendarRef, newView) => {
        const calendarApi = calendarRef.current.getApi();

        if (calendarApi.view.type == newView) return;

        setSelectedDates(null);

        calendarApi.changeView(newView);
        updateButtons(newView);
    }, [updateButtons]);

    const loadButtonsAtStart = useCallback(() => {
        const currentView = getCorrespondingView(isList, viewType);
        updateButtons(currentView);
    }, [isList, viewType, updateButtons]);

    const toggleList = useCallback(
        (calendarRef) => {
            const newState = !isList;
            setIsList(newState);

            const newView = getCorrespondingView(newState, viewType);

            updateView(calendarRef, newView);
        },
        [isList, viewType, updateView],
    );

    const setMonthView = useCallback(
        (calendarRef) => {
            setViewType("Month");

            const newView = getCorrespondingView(isList, "Month");

            updateView(calendarRef, newView);
        },
        [isList, updateView],
    );

    const setWeekView = useCallback(
        (calendarRef) => {
            setViewType("Week");

            const newView = getCorrespondingView(isList, "Week");

            updateView(calendarRef, newView);
        },
        [isList, updateView],
    );

    const setDayView = useCallback(
        (calendarRef) => {
            setViewType("Day");

            const newView = getCorrespondingView(isList, "Day");

            updateView(calendarRef, newView);
        },
        [isList, updateView],
    );

    const generateTitle = useCallback(
        (currentStatus) => {
            if (viewType == "Month") {
                const monthNumber = currentStatus.date.array[1];
                const month = getCalendarMonthName(monthNumber, true);
                const year = currentStatus.date.array[0];
                return `${month} de ${year}`;
            }

            const startDay = currentStatus.start.day;
            const startMonthNumber = currentStatus.start.month;
            const startMonth = getCalendarMonthName(startMonthNumber, false);
            const startYear = currentStatus.start.year;

            const endDay = currentStatus.end.day;
            const endMonthNumber = currentStatus.end.month;
            const isFullEndMonthName = viewType == "Day";
            const endMonth = getCalendarMonthName(
                endMonthNumber,
                isFullEndMonthName,
            );
            const endYear = currentStatus.end.year;

            const startMonthText =
                startMonth != endMonth ? ` ${startMonth}` : "";
            const startYearText = startYear != endYear ? ` ${startYear}` : "";
            const startText =
                viewType == "Week"
                    ? `${startDay}${startMonthText}${startYearText} - `
                    : "";
            return `${startText}${endDay} ${endMonth} ${endYear}`;
        },
        [viewType],
    );

    const getDayWidth = () => {
        const tableCell = document.querySelector(".fc-day");
        if (!tableCell) return 0;

        return tableCell.clientWidth || 0;
    };

    const getWeekDayName = useCallback(
        (currentDay) => {
            const weekDayIndex = currentDay.dow;
            const shortenedDays = [
                "Dom",
                "Lun",
                "Mar",
                "Mié",
                "Jue",
                "Vie",
                "Sáb",
            ];
            const fullDays = [
                "Domingo",
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
            ];
            const useShort = viewType != "Day" && getDayWidth() < 96;
            return useShort ? shortenedDays[weekDayIndex] : fullDays[weekDayIndex];
        },
        [viewType],
    );

    const resizeHandler = useCallback((calendarRef) => {
        const calendarApi = calendarRef?.current?.getApi?.();
        if (calendarApi) calendarApi.updateSize();
    }, []);

    const loadCalendarEvents = useCallback(
        async (startDate, endDate, employeeId, role) => {
            const personalEventsPromise =
                role !== "Coordinador" && employeeId
                    ? getEventsInRange(employeeId, startDate, endDate)
                    : Promise.resolve([]);

            const houseAbsencesPromise = canViewHouseAbsences(role)
                ? getHouseAbsencesInRange(startDate, endDate)
                : Promise.resolve([]);

            const [personalEvents, houseAbsences] = await Promise.all([
                personalEventsPromise,
                houseAbsencesPromise,
            ]);

            return [...(personalEvents ?? []), ...(houseAbsences ?? [])];
        },
        [],
    );

    const reloadCurrentRange = useCallback(async () => {
        if (!lastFetchedRange.current) return [];
        if (
            effectiveEmployeeId == "" &&
            !canViewHouseAbsences(effectiveViewerRole)
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

    const handleDatesSet = useCallback(
        async (dateInfo) => {
            const { startStr, endStr } = dateInfo;
            if (
                lastFetchedRange.current?.start === startStr &&
                lastFetchedRange.current?.end === endStr
            )
                return;
            lastFetchedRange.current = { start: startStr, end: endStr };

            if (
                effectiveEmployeeId == "" &&
                !canViewHouseAbsences(effectiveViewerRole)
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
        },
        [
            effectiveEmployeeId,
            effectiveViewerRole,
            loadCalendarEvents,
        ],
    );

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

    const handleDateDragging = useCallback(() => {
        setSelectedDates(null);
        return true;
    }, []);

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
