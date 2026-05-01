import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

const BaseCalendar = ({
    calendarRef,
    initialDate,
    //events,
    //isDayViewAvailable,
    //isList,
    //initialView
    /*toggleList,
    monthView,
    weekView,
    dayView*/
}) => {
    // TODO: Erase this
    const events = [
        { title: "event 1", date: "2026-04-01", backgroundColor: "#ff0000" },
        { title: "event 2", date: "2026-04-02" },
    ];

    const [isList, setIsList] = useState(false);
    const [viewType, setViewType] = useState("Month");

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

    // Component
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
        if (isComplete) {
            switch (monthNumber) {
                case 0:
                    return "Enero";
                case 1:
                    return "Febrero";
                case 2:
                    return "Marzo";
                case 3:
                    return "Abril";
                case 4:
                    return "Mayo";
                case 5:
                    return "Junio";
                case 6:
                    return "Julio";
                case 7:
                    return "Agosto";
                case 8:
                    return "Septiembre";
                case 9:
                    return "Octubre";
                case 10:
                    return "Noviembre";
                case 11:
                    return "Diciembre";
                default:
                    return "Mes inválido";
            }
        }

        switch (monthNumber) {
            case 0:
                return "Ene";
            case 1:
                return "Feb";
            case 2:
                return "Mar";
            case 3:
                return "Abr";
            case 4:
                return "May";
            case 5:
                return "Jun";
            case 6:
                return "Jul";
            case 7:
                return "Ago";
            case 8:
                return "Sept";
            case 9:
                return "Oct";
            case 10:
                return "Nov";
            case 11:
                return "Dic";
            default:
                return "Mes inválido";
        }
    };

    const generateTitle = (currentStatus) => {
        console.log(currentStatus);

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
                left: "prev next today",
                center: "title",
                right: "toggleListButton monthButton weekButton dayButton",
            }}
            titleFormat={(arg) => generateTitle(arg)}
            initialDate={initialDate}
            events={events}
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
        />
    );
};

export default BaseCalendar;
