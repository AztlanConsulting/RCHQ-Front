export const toDateOnly = (value) => {
    if (!value) return "";

    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return String(value).slice(0, 10);
};

export const parseDateOnly = (value) => {
    const dateOnly = toDateOnly(value);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;

    const date = new Date(`${dateOnly}T12:00:00`);

    return Number.isNaN(date.getTime()) ? null : date;
};

export const buildDateRuleFilter = (dateRules) => {
    const freeDays = new Set(dateRules?.freeDays ?? []);
    const nonWorkingWeekdays = new Set(dateRules?.nonWorkingWeekdays ?? []);

    return (date) => {
        const dateOnly = toDateOnly(date);

        if (!dateOnly) return true;
        if (freeDays.has(dateOnly)) return false;
        if (nonWorkingWeekdays.has(date.getDay())) return false;

        return true;
    };
};

export const getDateRuleError = (dateValue, dateRules) => {
    if (!dateValue || !dateRules) return "";

    const date = parseDateOnly(dateValue);

    if (!date) return "Selecciona una fecha válida";

    const dateOnly = toDateOnly(date);
    const minDate = dateRules.minDate ?? "";
    const maxDate = dateRules.maxDate ?? "";

    if (minDate && dateOnly < minDate) {
        return `La fecha no puede ser menor a ${minDate}`;
    }

    if (maxDate && dateOnly > maxDate) {
        return `La fecha no puede ser mayor a ${maxDate}`;
    }

    if ((dateRules.freeDays ?? []).includes(dateOnly)) {
        return "Este día es inhábil para el trabajador";
    }

    if ((dateRules.nonWorkingWeekdays ?? []).includes(date.getDay())) {
        return "Este día es inhábil para el trabajador";
    }

    return "";
};

export const mergeDateRuleErrors = (fieldErrors, form, dateRules) => {
    const nextErrors = { ...fieldErrors };
    const startDateError = getDateRuleError(form.startDate, dateRules);
    const endDateError = getDateRuleError(form.endDate, dateRules);

    if (startDateError && !nextErrors.startDate) {
        nextErrors.startDate = startDateError;
    }

    if (endDateError && !nextErrors.endDate) {
        nextErrors.endDate = endDateError;
    }

    return nextErrors;
};
