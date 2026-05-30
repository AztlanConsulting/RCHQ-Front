export {
    getBrowserTimeZone,
    MEXICO_TIME_ZONE,
    zonedDateTimeToIso,
} from "../../timeZone";

export const addDaysToDateOnly = (date, days) => {
    const [year, month, day] = date.split("-").map(Number);
    const nextDate = new Date(year, month - 1, day);
    nextDate.setDate(nextDate.getDate() + days);

    return [
        nextDate.getFullYear(),
        String(nextDate.getMonth() + 1).padStart(2, "0"),
        String(nextDate.getDate()).padStart(2, "0"),
    ].join("-");
};
