import {
    addDaysToDateOnly,
    normalizeDateOnly,
} from "../../calendarEventDetail";
import {
    dateInTimeZoneToInputValue,
    MEXICO_TIME_ZONE,
    timeInTimeZoneToInputValue,
    zonedDateTimeToIso,
} from "../../timeZone";

export const PERSONAL_EVENT_MEXICO_RANGE_ERROR =
    "No se puede crear un evento personal que abarque más de 1 día en horario central de México.";

export const shouldShowPersonalEndDateField = ({
    allDay,
    calendarTimeZoneMode,
    canSwitchCalendarTimeZone,
}) =>
    !allDay &&
    canSwitchCalendarTimeZone === true &&
    calendarTimeZoneMode === "local";

export const getPersonalMexicoRangeErrorKey = (allDay) =>
    allDay ? "date" : "endTime";

export const getPersonalTimeZoneSaveNotice = ({
    allDay,
    calendarTimeZoneMode,
    canSwitchCalendarTimeZone,
}) => {
    if (allDay && calendarTimeZoneMode !== "local") {
        return "Los eventos personales de todo el día se guardan con base en horario central de México porque, por regla de negocio, solo pueden durar 1 día en el calendario mexicano.";
    }

    if (!canSwitchCalendarTimeZone) return "";

    return calendarTimeZoneMode === "mexico"
        ? "Este evento se guardará con base en horario central de México. Además, no puede abarcar más de 1 día en horario central de México."
        : "Este evento se guardará con base en tu horario local. Sin embargo, no puede abarcar más de 1 día en horario central de México.";
};

export const getPersonalEndTimeMinTime = ({ date, endDate, startTime }) =>
    endDate && endDate !== date ? undefined : startTime;

const getMexicoPartsFromCalendarValue = (date, time, calendarTimeZone) => {
    if (!date || !time) return { date: "", time: "" };
    const isoValue = zonedDateTimeToIso(date, time, calendarTimeZone);

    return {
        date: dateInTimeZoneToInputValue(isoValue, MEXICO_TIME_ZONE),
        time: timeInTimeZoneToInputValue(isoValue, MEXICO_TIME_ZONE),
    };
};

export const getPersonalEventMexicoRangeError = ({
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    calendarTimeZone,
}) => {
    if (allDay) {
        const normalizedStartDate = normalizeDateOnly(startDate);
        const normalizedEndDate = normalizeDateOnly(endDate ?? startDate);

        return normalizedStartDate &&
            normalizedEndDate &&
            normalizedStartDate !== normalizedEndDate
            ? PERSONAL_EVENT_MEXICO_RANGE_ERROR
            : "";
    }

    if (!startDate || !startTime || !endTime) return "";

    const startMexico = getMexicoPartsFromCalendarValue(
        startDate,
        startTime,
        calendarTimeZone,
    );
    const endMexico = getMexicoPartsFromCalendarValue(
        endDate ?? startDate,
        endTime,
        calendarTimeZone,
    );

    const allowedMidnightEnd =
        endMexico.time === "00:00" &&
        normalizeDateOnly(endMexico.date) ===
            addDaysToDateOnly(startMexico.date, 1);

    if (
        startMexico.date &&
        endMexico.date &&
        startMexico.date !== endMexico.date &&
        !allowedMidnightEnd
    ) {
        return PERSONAL_EVENT_MEXICO_RANGE_ERROR;
    }

    return "";
};
