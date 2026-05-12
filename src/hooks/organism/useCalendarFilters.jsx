import { useEffect, useMemo, useState } from "react";
import { getEventsTypes } from "../../services/calendarService";

export const ENFOQUE_OPTIONS = [
    { value: "eventos",    label: "Eventos" },
    { value: "ausencias",  label: "Ausencias" },
    { value: "vacaciones", label: "Vacaciones" },
];

export const SCOPE_OPTIONS = [
    { value: "global",   label: "Global" },
    { value: "house",    label: "Casa" },
    { value: "personal", label: "Personal" },
];

export const useCalendarFilters = (allEvents = []) => {
    const [enfoqueFilters, setEnfoqueFilters] = useState(() =>
        ENFOQUE_OPTIONS.map((o) => o.value),
    );
    const [scopeFilters, setScopeFilters] = useState(() =>
        SCOPE_OPTIONS.map((o) => o.value),
    );
    const [tipoEventoOptions, setTipoEventoOptions] = useState([]);
    const [tipoEventoFilters, setTipoEventoFilters] = useState([]);

    useEffect(() => {
        getEventsTypes()
            .then((types) => {
                if (!Array.isArray(types)) return;
                const opts = types.map((t) => ({
                    value: String(t.name).toLowerCase(),
                    label: t.name,
                }));
                setTipoEventoOptions(opts);
                setTipoEventoFilters(opts.map((o) => o.value));
            })
            .catch(console.error);
    }, []);

    const showTipoEvento = enfoqueFilters.includes("eventos");
    const showVacaciones = enfoqueFilters.includes("vacaciones");
    const showAusencias  = enfoqueFilters.includes("ausencias");

    const visibleEvents = useMemo(() => {
        return allEvents
            .filter((e) => scopeFilters.includes(e.scope))         // TODO: confirm field name
            .filter((e) => tipoEventoFilters.includes(e.type))     // TODO: confirm field name
            .map((rawEvent) => ({
                title: rawEvent.name,
                start: rawEvent.start,
                end: rawEvent.end,
                backgroundColor: rawEvent.color,
                borderColor: rawEvent.color,
            }));
    }, [allEvents, scopeFilters, tipoEventoFilters]);

    return {
        enfoqueFilters, setEnfoqueFilters, enfoqueOptions: ENFOQUE_OPTIONS,
        scopeFilters,   setScopeFilters,   scopeOptions: SCOPE_OPTIONS,
        tipoEventoFilters, setTipoEventoFilters, tipoEventoOptions,
        showTipoEvento, showVacaciones, showAusencias,
        visibleEvents,
    };
};
