import { useEffect, useRef, useState, useCallback } from "react";
import {
    getEmployeeHouseName,
    getEventsInRange,
    getOwnEmployeeId,
} from "../../services/calendarService";
import { eventApiToDetail } from "../../utils/calendarEventDetail";
import { normalToUTCWithOffset } from "../../utils/dates";

export const useBaseCalendar = () => {
    const [isList, setIsList] = useState(false);
    const [viewType, setViewType] = useState("Month");
    const [viewEmployeeId, setViewEmployeeId] = useState("");
    const [employeeHouseName, setEmployeeHouseName] = useState("");
    const [allEvents, setAllEvents] = useState([]);
    const lastFetchedRange = useRef(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDates, setSelectedDates] = useState(null);

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
            "Fererob",
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

    const handleDatesSet = async (dateInfo) => {
        const { startStr, endStr } = dateInfo;
        if (
            lastFetchedRange.current?.start === startStr &&
            lastFetchedRange.current?.end === endStr
        )
            return;
        lastFetchedRange.current = { start: startStr, end: endStr };

        if (viewEmployeeId == "") return;

        try {
            const rawEvents = await getEventsInRange(
                viewEmployeeId,
                startStr.split("T")[0],
                endStr.split("T")[0],
            );
            setAllEvents(rawEvents ?? []);
        } catch (err) {
            console.error(err);
        }
    };

    // datesSet fires before setOwnCalendar sets the employee ID, so the first
    // call is skipped. Once the ID is available, re-fetch the stored range.
    useEffect(() => {
        if (!viewEmployeeId || !lastFetchedRange.current) return;
        const { start, end } = lastFetchedRange.current;
        getEventsInRange(viewEmployeeId, start.split("T")[0], end.split("T")[0])
            .then((raw) => setAllEvents(raw ?? []))
            .catch(console.error);
    }, [viewEmployeeId]);

    const setOwnCalendar = async () => {
        const ownId = getOwnEmployeeId();
        setViewEmployeeId(ownId);
        const employeeHouseName = await getEmployeeHouseName();
        console.log("result of getEmployeeHouseName call: ", employeeHouseName);
        setEmployeeHouseName(employeeHouseName);
    };

    const closeDetail = useCallback(() => setSelectedEvent(null), []);
    const closeCreationModal = useCallback((calendarRef) => {
        setSelectedDates(null);
        const calendarApi = calendarRef.current.getApi();
        calendarApi.unselect();
    }, []);

    const handleEventClick = useCallback((info) => {
        const detail = eventApiToDetail(info?.event);
        setSelectedEvent(detail);
    }, []);

    const handleDateDrags = useCallback((info, calendarRef) => {
        const startDate = normalToUTCWithOffset(info.start);
        const endDate = normalToUTCWithOffset(info.end, { seconds: -1 });

        const detail = `De ${startDate.getUTCDate()}/${startDate.getUTCMonth() + 1}/${startDate.getUTCFullYear()} ${startDate.getUTCHours()}:${startDate.getUTCMinutes()}:${startDate.getUTCSeconds()} a ${endDate.getUTCDate()}/${endDate.getUTCMonth() + 1}/${endDate.getUTCFullYear()} ${endDate.getUTCHours()}:${endDate.getUTCMinutes()}:${endDate.getUTCSeconds()}`;

        setSelectedDates(detail);

        const calendarApi = calendarRef.current.getApi();
        calendarApi.selectable = false;
    }, []);

    return {
        employeeHouseName,
        allEvents,
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
        selectedEvent,
        selectedDates,
        closeDetail,
        closeCreationModal,
        handleEventClick,
        handleDateDrags,
    };
};
