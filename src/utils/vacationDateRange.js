export const VACATION_DATE_RANGE_YEARS = 3;

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

export const getVacationDateRange = (baseDate = new Date()) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    return {
        minDate: new Date(year - VACATION_DATE_RANGE_YEARS, month, day),
        maxDate: new Date(year + VACATION_DATE_RANGE_YEARS, month, day),
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
