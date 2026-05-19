import { useCallback, useEffect, useMemo, useState } from "react";
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
import { getPersonalEventTitle } from "../../utils/titleGenerator"

const calculateTotalDays = (startDate, endDate) => {
    const start = toDateOnly(startDate);
    const end = toDateOnly(endDate);

    const totalDays = Math.round((end - start) / 86400000) + 1;

    return totalDays;
}

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

        const totalDays = calculateTotalDays(start, end);

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
    employeeFilters,
    absenceStatusFilters,
    absenceEvidenceFilters,
    calendarMode,
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
            calendarMode == "personal" ||
            (e.focus !== "ausencias" &&
            e.focus !== "vacaciones") ||
            employeeFilters.includes(String(e.employeeId))
        ))
        .filter((e) => (
            calendarMode == "personal" ||
            (e.focus !== "eventos" || e.scope !== "personal") ||!e.peopleInsideEvent ||
            employeeFilters.some((employeeId) => 
                e.peopleInsideEvent.some((person) => String(person.id) === String(employeeId))
            )
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
            const isAllDay = rawEvent.focus === "ausencias" || rawEvent.focus === "vacaciones";
            const isExpandedListAbsence = Boolean(
                isList
                &&( rawEvent.focus === "ausencias" || rawEvent.focus === "vacaciones")
                && rawEvent.currentDayIndex
                && rawEvent.totalDays,
            );
            const normalizedStartDate = normalizeDateOnly(
                isExpandedListAbsence
                    ? rawEvent.start
                    : rawEvent.startDate ?? rawEvent.start,
            );
            const normalizedEndDate = normalizeDateOnly(
                isExpandedListAbsence
                    ? rawEvent.end
                    : rawEvent.endDate ?? rawEvent.end,
            );
            const eventStart = isAllDay && normalizedStartDate
                ? normalizedStartDate
                : rawEvent.start;
            const eventEnd = isAllDay && normalizedEndDate
                ? (
                    isExpandedListAbsence
                        ? normalizedEndDate
                        : addDaysToDateOnly(normalizedEndDate, 1)
                )
                : rawEvent.end;

            return {
                id: String(idx),
                title: (rawEvent.focus === "ausencias" || rawEvent.focus === "vacaciones")
                    ? getPersonalEventTitle(rawEvent)
                    : rawEvent.name,
                start: eventStart,
                end: eventEnd,
                backgroundColor: rawEvent.focus === "ausencias"
                    ? "#EF4444"
                    : rawEvent.color,
                borderColor: rawEvent.focus === "ausencias"
                    ? "#DC2626"
                    : rawEvent.color || rawEvent.backgroundColor || "#000",
                allDay: isAllDay || Boolean(rawEvent.lastsAllDay),
                extendedProps: {
                    absenceId: rawEvent.absenceId,
                    absenceTypeId: rawEvent.absenceTypeId,
                    vacationId: rawEvent.vacationId,
                    vacationStatus: rawEvent.status,
                    vacationFeedback: rawEvent.feedback,
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
                    link: rawEvent.focus === "ausencias" ? rawEvent.link ?? "" : "",
                    startDate: normalizedStartDate || rawEvent.startDate || rawEvent.start || eventStart,
                    endDate: normalizedEndDate || rawEvent.endDate || rawEvent.end || eventStart,
                    isDeleted: Boolean(rawEvent.isDeleted),
                    currentDayIndex: rawEvent.currentDayIndex,
                    totalDays: rawEvent.totalDays || rawEvent.startDate ? calculateTotalDays(rawEvent.startDate, rawEvent.endDate) : "",
                    startReadableDate: rawEvent.startDate,
                    endReadableDate: rawEvent.endDate,
                    peopleInsideEvent: rawEvent.peopleInsideEvent ?? null,
                },
            };
        });
}

export const useCalendarFilters = (
    allEvents = [],
    { isList = false, viewerRole = "", calendarMode = "personal" } = {},
) => {
    const [focusFilters, setFocusFilters] = useState(() =>
        FOCUS_OPTIONS.map((o) => o.value),
    );
    const [scopeFilters, setScopeFilters] = useState(() =>
        SCOPE_OPTIONS.map((o) => o.value),
    );

    const [eventTypeOptions, setEventTypeOptions] = useState([]);
    const [eventTypeFilters, setEventTypeFilters] = useState([]);
    const [catalogAbsenceTypeOptions, setCatalogAbsenceTypeOptions] = useState([]);
    const [catalogEmployeeOptions, setCatalogEmployeeOptions] = useState([]);
    const [vacationStatusFilters, setVacationStatusFilters] = useState(() =>
        STATUS_OPTIONS.map((o) => o.value),
    );
    const [absenceTypeFilters, setAbsenceTypeFiltersState] = useState(null);
    const [hasCustomizedAbsenceTypeFilters, setHasCustomizedAbsenceTypeFilters] = useState(false);
    const [employeeFilters, setEmployeeFilters] = useState([]);
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [absenceStatusFilters, setAbsenceStatusFilters] = useState(() =>
        ["no_eliminadas"],
    );
    const [absenceEvidenceFilters, setAbsenceEvidenceFilters] = useState(() =>
        ABSENCE_EVIDENCE_OPTIONS.map((o) => o.value),
    );
    const [filtersModalOpen, setFiltersModalOpen] = useState(false);
    const canUseEmployeeCatalog =
        viewerRole === "Administrador" || viewerRole === "Coordinador";

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
    }, []);

    useEffect(() => {
        if (!canUseEmployeeCatalog) {
            Promise.resolve().then(() => setCatalogEmployeeOptions([]));
            return;
        }

        getHouseEmployees()
            .then((employees) => {
                if (!Array.isArray(employees)) return;

                setCatalogEmployeeOptions(
                    employees.map((employee) => ({
                        value: String(employee.employeeId),
                        label: employee.name,
                        curp: employee.curp ?? "",
                    })),
                );
            })
            .catch(() => {
                setCatalogEmployeeOptions([]);
            });
    }, [canUseEmployeeCatalog]);

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

    const fallbackEmployeeOptions = useMemo(() => {
        const employees = new Map();

        allEvents
            .filter((event) => event.focus === "ausencias" || event.focus === "vacaciones" || event.scope === "personal")
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

    const employeeOptions = useMemo(() => (
        catalogEmployeeOptions.length > 0
            ? catalogEmployeeOptions
            : fallbackEmployeeOptions
    ), [catalogEmployeeOptions, fallbackEmployeeOptions]);

    const setAbsenceTypeFilters = useCallback((nextValue) => {
        setHasCustomizedAbsenceTypeFilters(true);
        setAbsenceTypeFiltersState((previousValue) => {
            const resolvedPreviousValue = previousValue ?? absenceTypeOptions.map(
                (option) => option.value,
            );

            return typeof nextValue === "function"
                ? nextValue(resolvedPreviousValue)
                : nextValue;
        });
    }, [absenceTypeOptions]);

    const effectiveAbsenceTypeFilters = useMemo(() => {
        const nextValues = absenceTypeOptions.map((opt) => opt.value);

        if (!hasCustomizedAbsenceTypeFilters || absenceTypeFilters === null) {
            return nextValues;
        }
        if (absenceTypeFilters.length === 0) return [];

        return absenceTypeFilters.filter((value) => nextValues.includes(value));
    }, [absenceTypeFilters, absenceTypeOptions, hasCustomizedAbsenceTypeFilters]);

    const effectiveEmployeeFilters = useMemo(() => {
        const nextValues = employeeOptions.map((opt) => opt.value);

        if (employeeFilters.length === 0) return nextValues;

        const kept = employeeFilters.filter((value) =>
            nextValues.includes(value),
        );
        return kept.length > 0 ? kept : nextValues;
    }, [employeeFilters, employeeOptions]);

    const filteredEmployeeOptions = useMemo(() => {
        const normalizedSearch = employeeSearch.trim().toLowerCase();

        if (!normalizedSearch) return employeeOptions;

        return employeeOptions.filter((option) =>
            String(option.label).toLowerCase().includes(normalizedSearch),
        );
    }, [employeeOptions, employeeSearch]);

    const selectedEmployeeLabel = useMemo(() => {
        if (employeeOptions.length === 0) return "Sin trabajadores";
        if (effectiveEmployeeFilters.length === employeeOptions.length) {
            return "Todos";
        }
        if (effectiveEmployeeFilters.length === 0) return "Ninguno";
        if (effectiveEmployeeFilters.length === 1) {
            return employeeOptions.find(
                (option) => option.value === effectiveEmployeeFilters[0],
            )?.label ?? "1 seleccionado";
        }

        return `${effectiveEmployeeFilters.length} seleccionados`;
    }, [employeeOptions, effectiveEmployeeFilters]);

    const toggleEmployeeValue = (optionValue, checked) => {
        if (checked) {
            if (!effectiveEmployeeFilters.includes(optionValue)) {
                setEmployeeFilters([
                    ...effectiveEmployeeFilters,
                    optionValue,
                ]);
            }
            return;
        }

        setEmployeeFilters(
            effectiveEmployeeFilters.filter((value) => value !== optionValue),
        );
    };

    const clearEmployeeSelection = () => {
        setEmployeeFilters([]);
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
            effectiveEmployeeFilters,
            absenceStatusFilters,
            absenceEvidenceFilters,
            calendarMode,
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
            effectiveEmployeeFilters,
            absenceStatusFilters,
            absenceEvidenceFilters,
            calendarMode,
        ],
    );

    return {
        focusFilters, setFocusFilters, focusOptions: FOCUS_OPTIONS,
        scopeFilters,   setScopeFilters,   scopeOptions: SCOPE_OPTIONS,
        eventTypeFilters, setEventTypeFilters, eventTypeOptions,
        vacationStatusFilters, setVacationStatusFilters, vacationStatusOptions: STATUS_OPTIONS,
        absenceTypeFilters: effectiveAbsenceTypeFilters, setAbsenceTypeFilters, absenceTypeOptions,
        employeeFilters: effectiveEmployeeFilters,
        filteredEmployeeOptions,
        employeeSearch,
        selectedEmployeeLabel,
        setEmployeeFilters,
        setEmployeeSearch,
        toggleEmployeeValue,
        clearEmployeeSelection,
        employeeOptions,
        absenceStatusFilters, setAbsenceStatusFilters, absenceStatusOptions: ABSENCE_STATUS_OPTIONS,
        absenceEvidenceFilters, setAbsenceEvidenceFilters, absenceEvidenceOptions: ABSENCE_EVIDENCE_OPTIONS,
        showEventFilters, showVacationFilters, showAbscenceFilters,
        filtersModalOpen, setFiltersModalOpen,
        visibleEvents, 
    };
};