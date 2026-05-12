import { useEffect, useMemo, useState } from "react";
import { getEventsTypes } from "../../services/calendarService";

export const FOCUS_OPTIONS = [
    { value: "eventos",    label: "Eventos",    icon: "key" },
    { value: "vacaciones", label: "Vacaciones", icon: "showEye" },
    { value: "ausencias",  label: "Ausencias",  icon: "hideEye" },
];

export const SCOPE_OPTIONS = [
    { value: "global",   label: "Global",   color: "#C524FF" },
    { value: "house",    label: "Casa",     color: "#7FD447" },
    { value: "personal", label: "Personal", color: "#EFBF22" },
];

const getFilteredEvents = (
    allEvents = [],
    focusFilters,
    scopeFilters,
    eventTypeFilters,
) => {
    return allEvents
        .filter((e) => focusFilters.includes(e.focus))
        .filter((e) => scopeFilters.includes(e.scope))
        .filter((e) => eventTypeFilters.includes(String(e.type).toLowerCase()))
        .map((rawEvent, idx) => ({
            id: String(idx),
            title: rawEvent.name,
            start: rawEvent.start,
            end: rawEvent.end,
            // date: rawEvent.date,
            // subtitle: rawEvent.subtitle,
            // description: rawEvent.description,
            backgroundColor: rawEvent.color,
            borderColor: rawEvent.color,
            allDay: rawEvent.lastsAllDay,
            // lastsAllDay: rawEvent.lastsAllDay,
        }));
}

// const getFilteredVacations = (allVacations = []) => {
//     console.log("all vacations: ", all)
//     return allVacations
//         .filter((e) => scopeFilters.includes(e.scope))
// }

// const filterAbscences = (abscences = []) => {

// }

// export const useCalendarFilters = (allEvents = []) => {
export const useCalendarFilters = (
    allEvents = [],
    // allVacations = [],
    // allAbscences = [],
) => {
    const [focusFilters, setFocusFilters] = useState(() =>
        FOCUS_OPTIONS.map((o) => o.value),
    );
    const [scopeFilters, setScopeFilters] = useState(() =>
        SCOPE_OPTIONS.map((o) => o.value),
    );

    const [eventTypeOptions, setEventTypeOptions] = useState([]);
    const [eventTypeFilters, setEventTypeFilters] = useState([]);

    useEffect(() => {
        getEventsTypes()
            .then((types) => {
                if (!Array.isArray(types)) return;
                const opts = types.map((t) => ({
                    value: String(t.name).toLowerCase(),
                    label: t.name,
                }));
                setEventTypeOptions(opts);
                setEventTypeFilters(opts.map((o) => o.value));
            })
            .catch(console.error);
    }, []);

    const showEventFilters = focusFilters.includes("eventos");
    const showVacationFilters  = focusFilters.includes("vacaciones");
    const showAbscenceFilters  = focusFilters.includes("ausencias");

    const visibleEvents = useMemo(
        () => getFilteredEvents(allEvents, focusFilters, scopeFilters, eventTypeFilters),
        [allEvents, focusFilters, scopeFilters, eventTypeFilters],
    );

    // const visibleVacations = useMemo(() => {

    // }, [allVacations, focusFilters, scopeFilters, vacationFilters])

    return {
        focusFilters, setFocusFilters, focusOptions: FOCUS_OPTIONS,
        scopeFilters,   setScopeFilters,   scopeOptions: SCOPE_OPTIONS,
        eventTypeFilters, setEventTypeFilters, eventTypeOptions,
        showEventFilters, showVacationFilters, showAbscenceFilters,
        visibleEvents, 
        // visibleVacations, visibleAbscences,
    };
};
