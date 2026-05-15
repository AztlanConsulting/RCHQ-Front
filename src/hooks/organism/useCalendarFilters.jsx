import { useEffect, useMemo, useState } from "react";
import {
    getAbsenceTypes,
    getEventsTypes,
    getHouseEmployees,
} from "../../services/calendarService";
import {
    addDaysToDateOnly,
    dateOnlyToLocalDate,
    normalizeDateOnly,
} from "../../utils/calendarEventDetail";
import { 
    ABSENCE_EVIDENCE_OPTIONS,
    ABSENCE_STATUS_OPTIONS,
    FOCUS_OPTIONS, SCOPE_OPTIONS,
    STATUS_OPTIONS,
    getFocusOption, getScopeOption,
} from "../../utils/calendar.utils";

const getVacationStatusValue = (status) => {
    if (status === 1) return "aprobadas";
    if (status === 0) return "en_espera";
    return "rechazadas";
};

const getAbsenceStatusValue = (event) => (
    event.isDeleted ? "eliminadas" : "no_eliminadas"
);

const getAbsenceEvidenceValue = (event) => (
    event.link ? "con_evidencia" : "sin_evidencia"
);

const toDateOnly = (value) => {
    return dateOnlyToLocalDate(value);
};

const expandEventsForList = (events = [], isList) => {
    if (!isList) return events;

    const expanded = [];

    events.forEach((event) => {
        if (
            event.focus !== "ausencias" ||
            !event.startDate ||
            !event.endDate
        ) {
            expanded.push(event);
            return;
        }

        const start = toDateOnly(event.startDate);
        const end = toDateOnly(event.endDate);

        if (!start || !end || end < start) {
            expanded.push(event);
            return;
        }

        const totalDays = Math.round((end - start) / 86400000) + 1;

        for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + dayIndex);
            const currentDayValue = normalizeDateOnly(currentDay);
            const nextDayValue = addDaysToDateOnly(currentDayValue, 1);

            expanded.push({
                ...event,
                start: currentDayValue,
                end: nextDayValue,
                currentDayIndex: dayIndex + 1,
                totalDays,
            });
        }
    });

    return expanded;
};

const getFilteredEvents = (
    allEvents = [],
    isList,
    focusFilters,
    scopeFilters,
    eventTypeFilters,
    vacationStatusFilters,
    absenceTypeOptions,
    absenceTypeFilters,
    absenceEmployeeFilters,
    absenceStatusFilters,
    absenceEvidenceFilters,
) => {
    const selectedAbsenceTypeNames = new Set(
        absenceTypeOptions
            .filter((option) => absenceTypeFilters.includes(option.value))
            .map((option) => option.normalizedName ?? String(option.label).toLowerCase()),
    );

    return expandEventsForList(allEvents, isList)
        .filter((e) => focusFilters.includes(e.focus))
        .filter((e) => (
            e.focus !== "eventos" ||
            scopeFilters.includes(e.scope)
        ))
        .filter((e) => (
            e.focus !== "eventos" ||
            eventTypeFilters.includes(String(e.type).toLowerCase())
        ))
        .filter((e) => (
            e.focus !== "vacaciones" ||
            vacationStatusFilters.includes(getVacationStatusValue(e.status))
        ))
        .filter((e) => (
            e.focus !== "ausencias" ||
            absenceTypeFilters.includes(String(e.absenceTypeId ?? "")) ||
            selectedAbsenceTypeNames.has(String(e.type).toLowerCase())
        ))
        .filter((e) => (
            e.focus !== "ausencias" ||
            absenceEmployeeFilters.includes(String(e.employeeId))
        ))
        .filter((e) => (
            e.focus !== "ausencias" ||
            absenceStatusFilters.includes(getAbsenceStatusValue(e))
        ))
        .filter((e) => (
            e.focus !== "ausencias" ||
            absenceEvidenceFilters.includes(getAbsenceEvidenceValue(e))
        ))
        .map((rawEvent, idx) => {
            const isAllDayAbsence = rawEvent.focus === "ausencias";
            const normalizedStartDate = normalizeDateOnly(
                rawEvent.startDate ?? rawEvent.start,
            );
            const normalizedEndDate = normalizeDateOnly(
                rawEvent.endDate ?? rawEvent.end,
            );
            const eventStart = isAllDayAbsence && normalizedStartDate
                ? normalizedStartDate
                : rawEvent.start;
            const eventEnd = isAllDayAbsence && normalizedEndDate
                ? addDaysToDateOnly(normalizedEndDate, 1)
                : rawEvent.end;

            return {
                id: String(idx),
                title: rawEvent.focus === "ausencias"
                    ? `Ausencia de ${rawEvent.name}`
                    : rawEvent.name,
                start: eventStart,
                end: eventEnd,
                backgroundColor: rawEvent.focus === "ausencias"
                    ? "#EF4444"
                    : getScopeOption(rawEvent)?.color || rawEvent.color,
                borderColor: rawEvent.focus === "ausencias"
                    ? "#DC2626"
                    : rawEvent.color,
                allDay: isAllDayAbsence || Boolean(rawEvent.lastsAllDay),
                extendedProps: {
                    absenceId: rawEvent.absenceId,
                    absenceTypeId: rawEvent.absenceTypeId,
                    employeeId: rawEvent.employeeId,
                    employeeName: rawEvent.name,
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
                    curp: rawEvent.curp ?? "",
                    usedDays: rawEvent.usedDays,
                    link: rawEvent.link ?? "",
                    startDate: normalizedStartDate || rawEvent.startDate || rawEvent.start,
                    endDate: normalizedEndDate || rawEvent.endDate || rawEvent.end,
                    isDeleted: Boolean(rawEvent.isDeleted),
                    currentDayIndex: rawEvent.currentDayIndex,
                    totalDays: rawEvent.totalDays,
                },
            };
        });
}

export const useCalendarFilters = (allEvents = [], { isList = false } = {}) => {
    const [focusFilters, setFocusFilters] = useState(() =>
        FOCUS_OPTIONS.map((o) => o.value),
    );
    const [scopeFilters, setScopeFilters] = useState(() =>
        SCOPE_OPTIONS.map((o) => o.value),
    );

    const [eventTypeOptions, setEventTypeOptions] = useState([]);
    const [eventTypeFilters, setEventTypeFilters] = useState([]);
    const [catalogAbsenceTypeOptions, setCatalogAbsenceTypeOptions] = useState([]);
    const [catalogAbsenceEmployeeOptions, setCatalogAbsenceEmployeeOptions] = useState([]);
    const [vacationStatusFilters, setVacationStatusFilters] = useState(() =>
        STATUS_OPTIONS.map((o) => o.value),
    );
    const [absenceTypeFilters, setAbsenceTypeFilters] = useState([]);
    const [absenceEmployeeFilters, setAbsenceEmployeeFilters] = useState([]);
    const [absenceEmployeeSearch, setAbsenceEmployeeSearch] = useState("");
    const [absenceStatusFilters, setAbsenceStatusFilters] = useState(() =>
        ["no_eliminadas"],
    );
    const [absenceEvidenceFilters, setAbsenceEvidenceFilters] = useState(() =>
        ABSENCE_EVIDENCE_OPTIONS.map((o) => o.value),
    );

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

    useEffect(() => {
        getAbsenceTypes()
            .then((absenceTypes) => {
                if (!Array.isArray(absenceTypes)) return;

                setCatalogAbsenceTypeOptions(
                    absenceTypes.map((absenceType) => ({
                        value: String(
                            absenceType.absenceTypeId ?? absenceType.name?.toLowerCase?.() ?? "",
                        ),
                        label: absenceType.name,
                        normalizedName: String(absenceType.name).toLowerCase(),
                    })),
                );
            })
            .catch(() => {
                setCatalogAbsenceTypeOptions([]);
            });

        getHouseEmployees()
            .then((employees) => {
                if (!Array.isArray(employees)) return;

                setCatalogAbsenceEmployeeOptions(
                    employees.map((employee) => ({
                        value: String(employee.employeeId),
                        label: employee.name,
                        curp: employee.curp ?? "",
                    })),
                );
            })
            .catch(() => {
                setCatalogAbsenceEmployeeOptions([]);
            });
    }, []);

    const fallbackAbsenceTypeOptions = useMemo(() => {
        const labels = new Set();

        allEvents
            .filter((event) => event.focus === "ausencias")
            .forEach((event) => {
                if (event.type) labels.add(String(event.type));
            });

        return [...labels].map((label) => ({
            value: label.toLowerCase(),
            label,
            normalizedName: label.toLowerCase(),
        }));
    }, [allEvents]);

    const fallbackAbsenceEmployeeOptions = useMemo(() => {
        const employees = new Map();

        allEvents
            .filter((event) => event.focus === "ausencias")
            .forEach((event) => {
                if (!event.employeeId) return;
                employees.set(String(event.employeeId), {
                    value: String(event.employeeId),
                    label: event.name,
                });
            });

        return [...employees.values()].sort((a, b) =>
            a.label.localeCompare(b.label, "es"),
        );
    }, [allEvents]);

    const absenceTypeOptions = useMemo(() => (
        catalogAbsenceTypeOptions.length > 0
            ? catalogAbsenceTypeOptions
            : fallbackAbsenceTypeOptions
    ), [catalogAbsenceTypeOptions, fallbackAbsenceTypeOptions]);

    const absenceEmployeeOptions = useMemo(() => (
        catalogAbsenceEmployeeOptions.length > 0
            ? catalogAbsenceEmployeeOptions
            : fallbackAbsenceEmployeeOptions
    ), [catalogAbsenceEmployeeOptions, fallbackAbsenceEmployeeOptions]);

    const effectiveAbsenceTypeFilters = useMemo(() => {
        const nextValues = absenceTypeOptions.map((opt) => opt.value);

        if (absenceTypeFilters.length === 0) return nextValues;

        const kept = absenceTypeFilters.filter((value) => nextValues.includes(value));
        return kept.length > 0 ? kept : nextValues;
    }, [absenceTypeFilters, absenceTypeOptions]);

    const effectiveAbsenceEmployeeFilters = useMemo(() => {
        const nextValues = absenceEmployeeOptions.map((opt) => opt.value);

        if (absenceEmployeeFilters.length === 0) return nextValues;

        const kept = absenceEmployeeFilters.filter((value) =>
            nextValues.includes(value),
        );
        return kept.length > 0 ? kept : nextValues;
    }, [absenceEmployeeFilters, absenceEmployeeOptions]);

    const filteredAbsenceEmployeeOptions = useMemo(() => {
        const normalizedSearch = absenceEmployeeSearch.trim().toLowerCase();

        if (!normalizedSearch) return absenceEmployeeOptions;

        return absenceEmployeeOptions.filter((option) =>
            String(option.label).toLowerCase().includes(normalizedSearch),
        );
    }, [absenceEmployeeOptions, absenceEmployeeSearch]);

    const selectedAbsenceEmployeeLabel = useMemo(() => {
        if (absenceEmployeeOptions.length === 0) return "Sin trabajadores";
        if (effectiveAbsenceEmployeeFilters.length === absenceEmployeeOptions.length) {
            return "Todos";
        }
        if (effectiveAbsenceEmployeeFilters.length === 0) return "Ninguno";
        if (effectiveAbsenceEmployeeFilters.length === 1) {
            return absenceEmployeeOptions.find(
                (option) => option.value === effectiveAbsenceEmployeeFilters[0],
            )?.label ?? "1 seleccionado";
        }

        return `${effectiveAbsenceEmployeeFilters.length} seleccionados`;
    }, [absenceEmployeeOptions, effectiveAbsenceEmployeeFilters]);

    const toggleAbsenceEmployeeValue = (optionValue, checked) => {
        if (checked) {
            if (!effectiveAbsenceEmployeeFilters.includes(optionValue)) {
                setAbsenceEmployeeFilters([
                    ...effectiveAbsenceEmployeeFilters,
                    optionValue,
                ]);
            }
            return;
        }

        setAbsenceEmployeeFilters(
            effectiveAbsenceEmployeeFilters.filter((value) => value !== optionValue),
        );
    };

    const clearAbsenceEmployeeSelection = () => {
        setAbsenceEmployeeFilters([]);
    };

    const showEventFilters = focusFilters.includes("eventos");
    const showVacationFilters  = focusFilters.includes("vacaciones");
    const showAbscenceFilters  = focusFilters.includes("ausencias");

    const visibleEvents = useMemo(
        () => getFilteredEvents(
            allEvents,
            isList,
            focusFilters,
            scopeFilters,
            eventTypeFilters,
            vacationStatusFilters,
            absenceTypeOptions,
            effectiveAbsenceTypeFilters,
            effectiveAbsenceEmployeeFilters,
            absenceStatusFilters,
            absenceEvidenceFilters,
        ),
        [
            allEvents,
            isList,
            focusFilters,
            scopeFilters,
            eventTypeFilters,
            vacationStatusFilters,
            absenceTypeOptions,
            effectiveAbsenceTypeFilters,
            effectiveAbsenceEmployeeFilters,
            absenceStatusFilters,
            absenceEvidenceFilters,
        ],
    );

    return {
        focusFilters, setFocusFilters, focusOptions: FOCUS_OPTIONS,
        scopeFilters,   setScopeFilters,   scopeOptions: SCOPE_OPTIONS,
        eventTypeFilters, setEventTypeFilters, eventTypeOptions,
        vacationStatusFilters, setVacationStatusFilters, vacationStatusOptions: STATUS_OPTIONS,
        absenceTypeFilters: effectiveAbsenceTypeFilters, setAbsenceTypeFilters, absenceTypeOptions,
        absenceEmployeeFilters: effectiveAbsenceEmployeeFilters,
        filteredAbsenceEmployeeOptions,
        absenceEmployeeSearch,
        selectedAbsenceEmployeeLabel,
        setAbsenceEmployeeFilters,
        setAbsenceEmployeeSearch,
        toggleAbsenceEmployeeValue,
        clearAbsenceEmployeeSelection,
        absenceEmployeeOptions,
        absenceStatusFilters, setAbsenceStatusFilters, absenceStatusOptions: ABSENCE_STATUS_OPTIONS,
        absenceEvidenceFilters, setAbsenceEvidenceFilters, absenceEvidenceOptions: ABSENCE_EVIDENCE_OPTIONS,
        showEventFilters, showVacationFilters, showAbscenceFilters,
        visibleEvents, 
    };
};
