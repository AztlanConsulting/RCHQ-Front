import { useState } from "react";
import { getEventsInRange, getOwnEmployeeId } from "../../services/calendarService";
import { getReadableErrors } from "../../services/authService";

export const useBaseCalendar = () => {
    const [isList, setIsList] = useState(false);
    const [viewType, setViewType] = useState("Month");
    const [viewEmployeeId, setViewEmployeeId] = useState("");
    const [employeeHouseName, setEmployeeHouseName] = useState("");
    const [scopeFilters, setScopeFilters] = useState(["global", "house", "personal"]);
    const [typeFilters, setTypeFilters] = useState(["vacations", "general", "other"]);

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
    }

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
        const shortenedMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
        const fullMonths = ["Enero", "Fererob", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const monthText = isComplete ? fullMonths[monthNumber] : shortenedMonths[monthNumber];

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
    }

    const validateShortenedSize = () => {
        if (viewType == "Day") return false;

        const currentDayWidth = getDayWidth();

        if (currentDayWidth < 96) return true;

        return false;
    }

    const getWeekDayName = (currentDay) => {
        const weekDayIndex = currentDay.dow;
        const shortenedDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const fullDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const weekDay = validateShortenedSize() ? shortenedDays[weekDayIndex] : fullDays[weekDayIndex];
        return weekDay;
    }

    const resizeHandler = (calendarRef) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.render();
    }

    const fetchEventsInRange = async (dates, successCallback, failureCallback) => {
        if (viewEmployeeId == "") {
            successCallback([]);
            return;
        }

        const startDate = dates.startStr.split("T")[0];
        const endDate = dates.endStr.split("T")[0];

        try {
            const rawEvents = await getEventsInRange(viewEmployeeId, startDate, endDate);
            console.log(rawEvents);

            const events = [];
            rawEvents.forEach(rawEvent => {
                const color = (rawEvent.color).slice(1);
                console.log(color);
                const event = {
                    title: rawEvent.name,
                    start: rawEvent.start,
                    end: rawEvent.end,
                    backgroundColor: rawEvent.color,
                    borderColor: rawEvent.color,
                }
                events.push(event);
            });

            successCallback(events);
        } catch (err) {
            failureCallback(err);
            console.log(err);
        }
    }

    const setOwnCalendar = () => {
        const ownId = getOwnEmployeeId();
        setViewEmployeeId(ownId);
    }

    return {
        setViewEmployeeId,
        employeeHouseName,
        scopeFilters,
        setScopeFilters,
        typeFilters,
        setTypeFilters,
        loadButtonsAtStart,
        toggleList,
        setMonthView,
        setWeekView,
        setDayView,
        generateTitle,
        getWeekDayName,
        resizeHandler,
        fetchEventsInRange,
        setOwnCalendar
    }
}