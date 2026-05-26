export const MEXICO_TIME_ZONE = "America/Mexico_City";

export const getBrowserTimeZone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || MEXICO_TIME_ZONE;

export const isMexicoTimeZone = () =>
    getBrowserTimeZone() === MEXICO_TIME_ZONE;
