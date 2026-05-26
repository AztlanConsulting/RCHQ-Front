const DEFAULT_YEAR_RANGE = 5;

export const createDateAtDayBoundary = (date = new Date(), endOfDay = false) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0,
    );
    return normalizedDate;
};

export const createRelativeYearDate = (
    yearOffset,
    endOfDay = false,
    baseDate = new Date(),
) => {
    const date = createDateAtDayBoundary(baseDate, endOfDay);
    date.setFullYear(date.getFullYear() + yearOffset);
    return date;
};

export const getYearRangeDates = (
    yearRange = DEFAULT_YEAR_RANGE,
    baseDate = new Date(),
) => ({
    minDate: createRelativeYearDate(-yearRange, false, baseDate),
    maxDate: createRelativeYearDate(yearRange, true, baseDate),
});

export const toFilterDate = (value, endOfDay = false) => {
    if (!value) return undefined;

    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return undefined;

    return createDateAtDayBoundary(date, endOfDay);
};

export const getEarlierDate = (date, fallbackDate) =>
    date && date < fallbackDate ? date : fallbackDate;

export const getLaterDate = (date, fallbackDate) =>
    date && date > fallbackDate ? date : fallbackDate;
