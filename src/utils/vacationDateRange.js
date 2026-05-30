export const VACATION_PAST_LIMIT_MONTHS = 1;
export const VACATION_FUTURE_LIMIT_MONTHS = 18;

export const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const parseDateOnly = (value) => {
    if (!DATE_ONLY_REGEX.test(String(value ?? ""))) return null;

    const [year, month, day] = String(value).split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
};

export const formatDateOnly = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const addMonthsClamped = (baseDate, monthsToAdd) => {
    const targetFirstDay = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + monthsToAdd,
        1,
    );
    const lastDayOfTargetMonth = new Date(
        targetFirstDay.getFullYear(),
        targetFirstDay.getMonth() + 1,
        0,
    ).getDate();
    const day = Math.min(baseDate.getDate(), lastDayOfTargetMonth);

    return new Date(
        targetFirstDay.getFullYear(),
        targetFirstDay.getMonth(),
        day,
    );
};

export const getVacationDateRange = (baseDate = new Date()) => {
    return {
        minDate: addMonthsClamped(baseDate, -VACATION_PAST_LIMIT_MONTHS),
        maxDate: addMonthsClamped(baseDate, VACATION_FUTURE_LIMIT_MONTHS),
    };
};

export const getVacationDateRangeValues = (baseDate = new Date()) => {
    const { minDate, maxDate } = getVacationDateRange(baseDate);

    return {
        minDate: formatDateOnly(minDate),
        maxDate: formatDateOnly(maxDate),
    };
};

export const isDateWithinVacationRange = (value, baseDate = new Date()) => {
    const date = parseDateOnly(value);

    if (!date) return false;

    const { minDate, maxDate } = getVacationDateRange(baseDate);

    return date >= minDate && date <= maxDate;
};

export const getVacationEndDateMin = (startDateValue, fallbackMin, maxDate) => {
    const startDate = parseDateOnly(startDateValue);

    if (!startDate || startDate < fallbackMin || startDate > maxDate) {
        return fallbackMin;
    }

    return startDate;
};
