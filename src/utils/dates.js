export const dateToInputValue = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
};

export const timeToInputValue = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    return [
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
    ].join(":");
};

export const dateStringToInputValue = (value, fallbackDate) => {
    const matchedDate = String(value ?? "").match(/^(\d{4}-\d{2}-\d{2})/);
    if (matchedDate) return matchedDate[1];

    return dateToInputValue(fallbackDate);
};

export const timeStringToInputValue = (value, fallbackDate) => {
    const matchedTime = String(value ?? "").match(/T(\d{2}:\d{2})/);
    if (matchedTime) return matchedTime[1];

    return timeToInputValue(fallbackDate);
};

export const addDaysToInputValue = (dateValue, days) => {
    const [year, month, day] = String(dateValue).split("-").map(Number);
    if ([year, month, day].some(Number.isNaN)) return "";

    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    return dateToInputValue(date);
};

export const isPastDate = (date) => {
    const now = new Date();
    return now > date;
};

export const getStartHour = (timestamp) => {
    if (timestamp == null) return "";
    const base =
        timestamp instanceof Date
            ? new Date(timestamp.getTime())
            : new Date(timestamp);
    if (Number.isNaN(base.getTime())) return "";
    const h = base.getUTCHours();
    const m = base.getUTCMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
