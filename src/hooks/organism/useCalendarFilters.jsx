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
    FOCUS_OPTIONS,
    SCOPE_OPTIONS,
    STATUS_OPTIONS,
    getFocusOption,
    getScopeOption,
} from "../../utils/calendar.utils";
import { getPersonalEventTitle } from "../../utils/titleGenerator";
import {
    dateTimeInTimeZoneToCalendarValue,
    dateInTimeZoneToInputValue,
    getAllDayRangeInTimeZone,
} from "../../utils/timeZone";

const calculateTotalDays = (startDate, endDate) => {
    const start = toDateOnly(startDate);
    const end = toDateOnly(endDate);

    const totalDays = Math.round((end - start) / 86400000) + 1;

    return totalDays;
};

const getVacationStatusValue = (status) => {
    if (status === 1) return "aprobadas";
    if (status === 0) return "en_espera";
    return "rechazadas";
};

const getAbsenceStatusValue = (event) =>
    event.isDeleted ? "eliminadas" : "no_eliminadas";

const getAbsenceEvidenceValue = (event) =>
    event.link ? "con_evidencia" : "sin_evidencia";

const toDateOnly = (value) => {
    return dateOnlyToLocalDate(value);
};

const isEventMultiDay = (rawEvent, calendarTimeZone) => {
    if (rawEvent.focus !== "eventos") return false;
    if (rawEvent.allDay === true) return false;
    const startDay = dateInTimeZoneToInputValue(
        rawEvent.start ?? rawEvent.startDate,
        calendarTimeZone,
    );
    const endDay = dateInTimeZoneToInputValue(
        rawEvent.end ?? rawEvent.endDate,
        calendarTimeZone,
    );
    if (!startDay || !endDay) return false;
    return startDay !== endDay;
};

const isTimeGridCalendarView = (calendarView) =>
    calendarView === "timeGridWeek" || calendarView === "timeGridDay";

const MIDNIGHT_TIME = "T00:00:00";

const buildCalendarDateTime = (dateValue) => `${dateValue}${MIDNIGHT_TIME}`;

const isMidnightCalendarDateTime = (value) =>
    typeof value === "string" && value.endsWith(MIDNIGHT_TIME);

const getTimedRangeInTimeZone = (event, calendarTimeZone) => {
    const startDate = dateInTimeZoneToInputValue(
        event.start,
        calendarTimeZone,
    );
    const endDate = dateInTimeZoneToInputValue(event.end, calendarTimeZone);

    if (!startDate || !endDate || endDate < startDate) {
        return null;
    }

    const calendarEnd = dateTimeInTimeZoneToCalendarValue(
        event.end,
        calendarTimeZone,
    );
    const displayEndDate =
        endDate > startDate && isMidnightCalendarDateTime(calendarEnd)
            ? addDaysToDateOnly(endDate, -1)
            : endDate;

    return {
        startDate,
        displayEndDate,
        calendarStart: dateTimeInTimeZoneToCalendarValue(
            event.start,
            calendarTimeZone,
        ),
        calendarEnd,
    };
};

const buildTimeGridAllDayEvent = (event, allDayRange) => ({
    ...event,
    calendarEventStart: allDayRange.startDate,
    calendarEventEnd: allDayRange.calendarEndDate,
    calendarEventAllDay: true,
    calendarStartReadableDate: allDayRange.startDate,
    calendarEndReadableDate: allDayRange.displayEndDate,
    totalDays:
        event.totalDays ??
        calculateTotalDays(allDayRange.startDate, allDayRange.displayEndDate),
});

const expandEventsForTimeGrid = (
    events = [],
    isList,
    calendarView,
    calendarTimeZone,
) => {
    if (isList || !isTimeGridCalendarView(calendarView)) return events;

    const expanded = [];

    events.forEach((event) => {
        if (!event.start || !event.end) {
            expanded.push(event);
            return;
        }

        const allDayRange = getAllDayRangeInTimeZone(
            event.start,
            event.end,
            calendarTimeZone,
        );

        if (allDayRange.isAllDay) {
            expanded.push(buildTimeGridAllDayEvent(event, allDayRange));
            return;
        }

        const visibleRange = getTimedRangeInTimeZone(event, calendarTimeZone);

        if (!visibleRange) {
            expanded.push(event);
            return;
        }

        const start = toDateOnly(visibleRange.startDate);
        const end = toDateOnly(visibleRange.displayEndDate);

        if (!start || !end || end < start) {
            expanded.push(event);
            return;
        }

        const totalDays = calculateTotalDays(start, end);

        if (totalDays <= 1) {
            expanded.push({
                ...event,
                calendarEventStart: visibleRange.calendarStart,
                calendarEventEnd: visibleRange.calendarEnd,
                calendarEventAllDay: false,
                calendarStartReadableDate: visibleRange.startDate,
                calendarEndReadableDate: visibleRange.displayEndDate,
                totalDays: event.totalDays ?? totalDays,
            });
            return;
        }

        let pendingAllDaySegment = null;

        const pushPendingAllDaySegment = () => {
            if (!pendingAllDaySegment) return;
            expanded.push(pendingAllDaySegment);
            pendingAllDaySegment = null;
        };

        for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + dayIndex);
            const currentDayValue = normalizeDateOnly(currentDay);
            const nextDayValue = addDaysToDateOnly(currentDayValue, 1);
            const isFirstDay = dayIndex === 0;
            const isLastDay = dayIndex === totalDays - 1;
            const fullDayStart = buildCalendarDateTime(currentDayValue);
            const fullDayEnd = buildCalendarDateTime(nextDayValue);
            const segmentStart = isFirstDay
                ? visibleRange.calendarStart
                : fullDayStart;
            const segmentEnd = isLastDay
                ? visibleRange.calendarEnd
                : fullDayEnd;
            const segmentAllDay =
                segmentStart === fullDayStart && segmentEnd === fullDayEnd;

            const segmentEvent = {
                ...event,
                calendarEventStart: segmentAllDay
                    ? currentDayValue
                    : segmentStart,
                calendarEventEnd: segmentAllDay ? nextDayValue : segmentEnd,
                calendarEventAllDay: segmentAllDay,
                calendarStartReadableDate: currentDayValue,
                calendarEndReadableDate: currentDayValue,
                totalDays: event.totalDays ?? totalDays,
            };

            if (!segmentAllDay) {
                pushPendingAllDaySegment();
                expanded.push(segmentEvent);
                continue;
            }

            if (pendingAllDaySegment) {
                pendingAllDaySegment = {
                    ...pendingAllDaySegment,
                    calendarEventEnd: segmentEvent.calendarEventEnd,
                    calendarEndReadableDate:
                        segmentEvent.calendarEndReadableDate,
                };
                continue;
            }

            pendingAllDaySegment = segmentEvent;
        }

        pushPendingAllDaySegment();
    });

    return expanded;
};

const expandEventsForList = (events = [], isList, calendarTimeZone) => {
    if (!isList) return events;

    const expanded = [];

    events.forEach((event) => {
        if (event.allDay !== true || !event.start || !event.end) {
            expanded.push(event);
            return;
        }

        const allDayRange = getAllDayRangeInTimeZone(
            event.start,
            event.end,
            calendarTimeZone,
        );
        const visibleRange = allDayRange.isAllDay
            ? allDayRange
            : getTimedRangeInTimeZone(event, calendarTimeZone);

        if (!visibleRange) {
            expanded.push(event);
            return;
        }

        const start = toDateOnly(visibleRange.startDate);
        const end = toDateOnly(visibleRange.displayEndDate);

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
            const isFirstDay = dayIndex === 0;
            const isLastDay = dayIndex === totalDays - 1;
            const segmentAllDay =
                allDayRange.isAllDay || (!isFirstDay && !isLastDay);
            const dayStartValue = segmentAllDay
                ? currentDayValue
                : `${currentDayValue}T00:00:00`;
            const dayEndValue = segmentAllDay
                ? nextDayValue
                : `${nextDayValue}T00:00:00`;

            expanded.push({
                ...event,
                listEventStart:
                    segmentAllDay || !isFirstDay
                        ? dayStartValue
                        : visibleRange.calendarStart,
                listEventEnd:
                    segmentAllDay || !isLastDay
                        ? dayEndValue
                        : visibleRange.calendarEnd,
                listEventAllDay: segmentAllDay,
                listStartReadableDate: currentDayValue,
                listEndReadableDate: currentDayValue,
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
    viewerRole,
    calendarView = "dayGridMonth",
    calendarTimeZone,
) => {
    const selectedAbsenceTypeNames = new Set(
        absenceTypeOptions
            .filter((option) => absenceTypeFilters.includes(option.value))
            .map(
                (option) =>
                    option.normalizedName ?? String(option.label).toLowerCase(),
            ),
    );

    return expandEventsForTimeGrid(
        expandEventsForList(allEvents, isList, calendarTimeZone),
        isList,
        calendarView,
        calendarTimeZone,
    )
        .filter((e) => focusFilters.includes(e.focus))
        .filter((e) => e.focus !== "eventos" || scopeFilters.includes(e.scope))
        .filter(
            (e) =>
                e.focus !== "eventos" ||
                eventTypeFilters.includes(String(e.type).toLowerCase()),
        )
        .filter(
            (e) =>
                e.focus !== "vacaciones" ||
                vacationStatusFilters.includes(
                    getVacationStatusValue(e.status),
                ),
        )
        .filter(
            (e) =>
                e.focus !== "ausencias" ||
                absenceTypeFilters.includes(String(e.absenceTypeId ?? "")) ||
                selectedAbsenceTypeNames.has(String(e.type).toLowerCase()),
        )
        .filter(
            (e) =>
                calendarMode == "personal" ||
                (e.focus !== "ausencias" && e.focus !== "vacaciones") ||
                employeeFilters.includes(String(e.employeeId)),
        )
        .filter(
            (e) =>
                calendarMode == "personal" ||
                e.focus !== "eventos" ||
                e.scope !== "personal" ||
                !e.peopleInsideEvent ||
                employeeFilters.some((employeeId) =>
                    e.peopleInsideEvent.some(
                        (person) => String(person.id) === String(employeeId),
                    ),
                ),
        )
        .filter(
            (e) =>
                e.focus !== "ausencias" ||
                absenceStatusFilters.includes(getAbsenceStatusValue(e)),
        )
        .filter(
            (e) =>
                e.focus !== "ausencias" ||
                absenceEvidenceFilters.includes(getAbsenceEvidenceValue(e)),
        )
        .map((rawEvent, idx) => {
            const isRangeRecord =
                rawEvent.focus === "ausencias" ||
                rawEvent.focus === "vacaciones";
            const isMultiDay = isEventMultiDay(rawEvent, calendarTimeZone);
            const isExpandedListEvent = Boolean(
                isList && rawEvent.currentDayIndex && rawEvent.totalDays,
            );
            const isExpandedTimeGridEvent = Boolean(
                !isList && rawEvent.calendarEventStart,
            );
            const allDayRange = isExpandedListEvent && rawEvent.listEventAllDay
                ? {
                      isAllDay: true,
                      startDate: rawEvent.listEventStart,
                      displayEndDate: rawEvent.listEndReadableDate,
                      calendarEndDate: rawEvent.listEventEnd,
                  }
                : isExpandedTimeGridEvent && rawEvent.calendarEventAllDay
                  ? {
                        isAllDay: true,
                        startDate: rawEvent.calendarStartReadableDate,
                        displayEndDate: rawEvent.calendarEndReadableDate,
                        calendarEndDate: rawEvent.calendarEventEnd,
                    }
                : getAllDayRangeInTimeZone(
                      rawEvent.start,
                      rawEvent.end,
                      calendarTimeZone,
                  );
            const isAllDay = isExpandedListEvent
                ? rawEvent.listEventAllDay === true
                : isExpandedTimeGridEvent
                  ? rawEvent.calendarEventAllDay === true
                  : rawEvent.allDay === true && allDayRange.isAllDay;
            const normalizedStartDate =
                allDayRange.startDate ||
                normalizeDateOnly(rawEvent.startDate ?? rawEvent.start);
            const normalizedEndDate =
                allDayRange.displayEndDate ||
                normalizeDateOnly(rawEvent.endDate ?? rawEvent.end);
            const eventStart = isExpandedTimeGridEvent
                ? rawEvent.calendarEventStart
                : isAllDay && normalizedStartDate && !isExpandedListEvent
                  ? allDayRange.startDate || normalizedStartDate
                  : rawEvent.listEventStart
                    ? rawEvent.listEventStart
                    : dateTimeInTimeZoneToCalendarValue(
                          rawEvent.start,
                          calendarTimeZone,
                      );
            const eventEnd = isExpandedTimeGridEvent
                ? rawEvent.calendarEventEnd
                : isAllDay && normalizedEndDate && !isExpandedListEvent
                  ? allDayRange.calendarEndDate ||
                    (isRangeRecord
                        ? addDaysToDateOnly(normalizedEndDate, 1)
                        : normalizedEndDate === normalizedStartDate
                          ? addDaysToDateOnly(normalizedEndDate, 1)
                          : normalizedEndDate)
                  : rawEvent.listEventEnd
                    ? rawEvent.listEventEnd
                    : dateTimeInTimeZoneToCalendarValue(
                          rawEvent.end,
                          calendarTimeZone,
                      );
            const displayStartDate = isAllDay
                ? allDayRange.startDate
                : rawEvent.listStartReadableDate
                  ? rawEvent.listStartReadableDate
                  : dateInTimeZoneToInputValue(rawEvent.start, calendarTimeZone);
            const displayEndDate = isAllDay
                ? allDayRange.displayEndDate
                : rawEvent.listEndReadableDate
                  ? rawEvent.listEndReadableDate
                  : dateInTimeZoneToInputValue(rawEvent.end, calendarTimeZone);
            const originalAllDayRange = getAllDayRangeInTimeZone(
                rawEvent.start,
                rawEvent.end,
                calendarTimeZone,
            );
            const originalStartDate = originalAllDayRange.isAllDay
                ? originalAllDayRange.startDate
                : dateInTimeZoneToInputValue(rawEvent.start, calendarTimeZone);
            const originalEndDate = originalAllDayRange.isAllDay
                ? originalAllDayRange.displayEndDate
                : dateInTimeZoneToInputValue(rawEvent.end, calendarTimeZone);
            const storedStartDate = isRangeRecord
                ? normalizeDateOnly(rawEvent.startDate) || originalStartDate
                : originalStartDate ||
                  normalizeDateOnly(rawEvent.startDate) ||
                  normalizeDateOnly(rawEvent.start);
            const storedEndDate = isRangeRecord
                ? normalizeDateOnly(rawEvent.endDate) || originalEndDate
                : originalEndDate ||
                  normalizeDateOnly(rawEvent.endDate) ||
                  normalizeDateOnly(rawEvent.end);
            const detailAllDay =
                rawEvent.allDay === true && originalAllDayRange.isAllDay;

            return {
                id: String(idx),
                title:
                    rawEvent.focus === "ausencias" ||
                    rawEvent.focus === "vacaciones"
                        ? getPersonalEventTitle(rawEvent, viewerRole)
                        : rawEvent.name,
                start: eventStart,
                end: eventEnd,
                backgroundColor:
                    rawEvent.focus === "ausencias"
                        ? rawEvent.isDeleted ? "#3E000C" : "#A8201A"
                        : rawEvent.color,
                borderColor:
                    rawEvent.focus === "ausencias"
                        ? rawEvent.isDeleted ? "#3E000C" : "#A8201A"
                        : rawEvent.color || rawEvent.backgroundColor || "#000",
                allDay: isAllDay,
                extendedProps: {
                    houseEventId: rawEvent.houseEventId,
                    eventId: rawEvent.eventId ?? rawEvent.id,
                    eventTypeId: rawEvent.eventTypeId,
                    absenceId: rawEvent.absenceId,
                    absenceTypeId: rawEvent.absenceTypeId,
                    vacationId: rawEvent.vacationId,
                    vacationRequestId: rawEvent.vacationRequestId,
                    vacationStatus: rawEvent.status,
                    vacationFeedback: rawEvent.feedback,
                    employeeId: rawEvent.employeeId,
                    employeeName: rawEvent.name,
                    utcStart: rawEvent.start,
                    utcEnd: rawEvent.end,
                    subtitle: rawEvent.subtitle ?? "",
                    description: rawEvent.description ?? "",
                    focus: rawEvent.focus,
                    focusLabel:
                        getFocusOption(rawEvent)?.label ?? rawEvent.focus,
                    scope: rawEvent.scope,
                    scopeLabel:
                        getScopeOption(rawEvent)?.label ?? rawEvent.scope,
                    eventType: rawEvent.type,
                    isFreeDay: Boolean(rawEvent.isFreeDay),
                    multiDay: isMultiDay,
                    sourceStart: rawEvent.start,
                    sourceEnd: rawEvent.end,
                    detailAllDay,
                    date: rawEvent.date ?? "",
                    icon: getFocusOption(rawEvent)?.icon ?? "",
                    status: rawEvent.status,
                    curp: rawEvent.curp ?? "",
                    usedDays: rawEvent.usedDays,
                    link:
                        rawEvent.focus === "ausencias"
                            ? (rawEvent.link ?? "")
                            : "",
                    startDate:
                        storedStartDate ||
                        rawEvent.startDate ||
                        rawEvent.start ||
                        eventStart,
                    endDate:
                        storedEndDate ||
                        rawEvent.endDate ||
                        rawEvent.end ||
                        eventStart,
                    isDeleted: Boolean(rawEvent.isDeleted),
                    currentDayIndex: rawEvent.currentDayIndex,
                    totalDays:
                        rawEvent.totalDays ??
                        (
                            normalizedStartDate && normalizedEndDate
                                ? calculateTotalDays(normalizedStartDate, normalizedEndDate)
                                : ""
                        ),
                    startReadableDate:
                        originalStartDate ||
                        displayStartDate ||
                        rawEvent.startDate ||
                        rawEvent.start ||
                        "",
                    endReadableDate:
                        originalEndDate ||
                        displayEndDate ||
                        rawEvent.endDate ||
                        rawEvent.end ||
                        "",
                    peopleInsideEvent: rawEvent.peopleInsideEvent ?? null,
                    trainer: rawEvent.trainer ?? "",
                },
            };
        });
};

export const useCalendarFilters = (
    allEvents = [],
    {
        isList = false,
        viewerRole = "",
        calendarMode = "personal",
        calendarView = "dayGridMonth",
        calendarTimeZone,
    } = {},
) => {
    const [focusFilters, setFocusFilters] = useState(() =>
        FOCUS_OPTIONS.map((o) => o.value),
    );
    const [scopeFilters, setScopeFilters] = useState(() =>
        SCOPE_OPTIONS.map((o) => o.value),
    );

    const [eventTypeOptions, setEventTypeOptions] = useState([]);
    const [eventTypeFilters, setEventTypeFilters] = useState([]);
    const [catalogAbsenceTypeOptions, setCatalogAbsenceTypeOptions] = useState(
        [],
    );
    const [catalogEmployeeOptions, setCatalogEmployeeOptions] = useState([]);
    const [vacationStatusFilters, setVacationStatusFilters] = useState(() =>
        STATUS_OPTIONS.map((o) => o.value),
    );
    const [absenceTypeFilters, setAbsenceTypeFiltersState] = useState(null);
    const [
        hasCustomizedAbsenceTypeFilters,
        setHasCustomizedAbsenceTypeFilters,
    ] = useState(false);
    const [employeeFilters, setEmployeeFilters] = useState(null);
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [absenceStatusFilters, setAbsenceStatusFilters] = useState(() => [
        "no_eliminadas",
    ]);
    const [absenceEvidenceFilters, setAbsenceEvidenceFilters] = useState(() =>
        ABSENCE_EVIDENCE_OPTIONS.map((o) => o.value),
    );
    const [filtersModalOpen, setFiltersModalOpen] = useState(false);
    const canUseEmployeeCatalog = viewerRole === "Coordinador";

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
        if (!allEvents || allEvents.length === 0) return;

        setEventTypeOptions((prevOptions) => {
            const known = new Set(prevOptions.map((o) => o.value));
            const toAdd = [];
            for (const e of allEvents) {
                if (e.focus !== "eventos") continue;
                const key = String(e.type || "").toLowerCase();
                if (key && !known.has(key)) {
                    toAdd.push({ value: key, label: e.type });
                    known.add(key);
                }
            }
            return toAdd.length === 0 ? prevOptions : [...prevOptions, ...toAdd];
        });

        setEventTypeFilters((prevFilters) => {
            const current = new Set(prevFilters);
            const toAdd = [];
            for (const e of allEvents) {
                if (e.focus !== "eventos") continue;
                const key = String(e.type || "").toLowerCase();
                if (key && !current.has(key)) {
                    toAdd.push(key);
                    current.add(key);
                }
            }
            return toAdd.length === 0 ? prevFilters : [...prevFilters, ...toAdd];
        });
    }, [allEvents]);

    useEffect(() => {
        getAbsenceTypes()
            .then((absenceTypes) => {
                if (!Array.isArray(absenceTypes)) return;

                setCatalogAbsenceTypeOptions(
                    absenceTypes.map((absenceType) => ({
                        value: String(
                            absenceType.absenceTypeId ??
                                absenceType.name?.toLowerCase?.() ??
                                "",
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
            .filter(
                (event) =>
                    event.focus === "ausencias" ||
                    event.focus === "vacaciones" ||
                    event.scope === "personal",
            )
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

    const absenceTypeOptions = useMemo(
        () =>
            catalogAbsenceTypeOptions.length > 0
                ? catalogAbsenceTypeOptions
                : fallbackAbsenceTypeOptions,
        [catalogAbsenceTypeOptions, fallbackAbsenceTypeOptions],
    );

    const employeeOptions = useMemo(
        () =>
            catalogEmployeeOptions.length > 0
                ? catalogEmployeeOptions
                : fallbackEmployeeOptions,
        [catalogEmployeeOptions, fallbackEmployeeOptions],
    );

    const setAbsenceTypeFilters = useCallback(
        (nextValue) => {
            setHasCustomizedAbsenceTypeFilters(true);
            setAbsenceTypeFiltersState((previousValue) => {
                const resolvedPreviousValue =
                    previousValue ??
                    absenceTypeOptions.map((option) => option.value);

                return typeof nextValue === "function"
                    ? nextValue(resolvedPreviousValue)
                    : nextValue;
            });
        },
        [absenceTypeOptions],
    );

    const effectiveAbsenceTypeFilters = useMemo(() => {
        const nextValues = absenceTypeOptions.map((opt) => opt.value);

        if (!hasCustomizedAbsenceTypeFilters || absenceTypeFilters === null) {
            return nextValues;
        }
        if (absenceTypeFilters.length === 0) return [];

        return absenceTypeFilters.filter((value) => nextValues.includes(value));
    }, [
        absenceTypeFilters,
        absenceTypeOptions,
        hasCustomizedAbsenceTypeFilters,
    ]);

    const effectiveEmployeeFilters = useMemo(() => {
        const nextValues = employeeOptions.map((opt) => opt.value);

        if (employeeFilters === null) return nextValues;
        if (employeeFilters.length === 0) return [];

        const kept = employeeFilters.filter((value) =>
            nextValues.includes(value),
        );
        return kept;
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
            return (
                employeeOptions.find(
                    (option) => option.value === effectiveEmployeeFilters[0],
                )?.label ?? "1 seleccionado"
            );
        }

        return `${effectiveEmployeeFilters.length} seleccionados`;
    }, [employeeOptions, effectiveEmployeeFilters]);

    const toggleEmployeeValue = (optionValue, checked) => {
        if (checked) {
            if (!effectiveEmployeeFilters.includes(optionValue)) {
                setEmployeeFilters([...effectiveEmployeeFilters, optionValue]);
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

    const resetEmployeeSelection = () => {
        setEmployeeFilters(null);
    };

    const showEventFilters = focusFilters.includes("eventos");
    const showVacationFilters = focusFilters.includes("vacaciones");
    const showAbscenceFilters = focusFilters.includes("ausencias");

    const visibleEvents = useMemo(
        () =>
            getFilteredEvents(
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
                viewerRole,
                calendarView,
                calendarTimeZone,
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
            viewerRole,
            calendarView,
            calendarTimeZone,
        ],
    );

    return {
        focusFilters,
        setFocusFilters,
        focusOptions: FOCUS_OPTIONS,
        scopeFilters,
        setScopeFilters,
        scopeOptions: SCOPE_OPTIONS,
        eventTypeFilters,
        setEventTypeFilters,
        eventTypeOptions,
        vacationStatusFilters,
        setVacationStatusFilters,
        vacationStatusOptions: STATUS_OPTIONS,
        absenceTypeFilters: effectiveAbsenceTypeFilters,
        setAbsenceTypeFilters,
        absenceTypeOptions,
        employeeFilters: effectiveEmployeeFilters,
        filteredEmployeeOptions,
        employeeSearch,
        selectedEmployeeLabel,
        setEmployeeFilters,
        setEmployeeSearch,
        toggleEmployeeValue,
        clearEmployeeSelection,
        resetEmployeeSelection,
        employeeOptions,
        absenceStatusFilters,
        setAbsenceStatusFilters,
        absenceStatusOptions: ABSENCE_STATUS_OPTIONS,
        absenceEvidenceFilters,
        setAbsenceEvidenceFilters,
        absenceEvidenceOptions: ABSENCE_EVIDENCE_OPTIONS,
        showEventFilters,
        showVacationFilters,
        showAbscenceFilters,
        filtersModalOpen,
        setFiltersModalOpen,
        visibleEvents,
    };
};
