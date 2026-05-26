export const dateToInputValue = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
};

export const isPastDate = (date) => {
    const now = new Date();
    return now > date;
};
