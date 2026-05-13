import { useEffect, useMemo, useState } from "react";
import { getEventsTypes } from "../../services/calendarService";
import { 
    FOCUS_OPTIONS, SCOPE_OPTIONS,
    getFocusOption, getScopeOption,
} from "../../utils/calendar.utils";

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
            backgroundColor: getScopeOption(rawEvent)?.color || rawEvent.color,
            borderColor: rawEvent.color,
            allDay: Boolean(rawEvent.lastsAllDay),
            extendedProps: {
                subtitle: rawEvent.subtitle ?? "",
                description: rawEvent.description ?? "",
                focus: rawEvent.focus,
                focusLabel: getFocusOption(rawEvent)?.label ?? rawEvent.focus,
                scope: rawEvent.scope,
                scopeLabel: getScopeOption(rawEvent)?.label ?? rawEvent.scope,
                eventType: rawEvent.type,
                date: rawEvent.date ?? "",
                icon: getFocusOption(rawEvent)?.icon ?? "",
                status: rawEvent.status,
            },
        }));
}

export const useCalendarFilters = (allEvents = []) => {
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

    return {
        focusFilters, setFocusFilters, focusOptions: FOCUS_OPTIONS,
        scopeFilters,   setScopeFilters,   scopeOptions: SCOPE_OPTIONS,
        eventTypeFilters, setEventTypeFilters, eventTypeOptions,
        showEventFilters, showVacationFilters, showAbscenceFilters,
        visibleEvents, 
    };
};
