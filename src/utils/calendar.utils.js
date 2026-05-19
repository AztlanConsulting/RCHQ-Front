export const FOCUS_OPTIONS = [
    { value: "eventos",    label: "Eventos",    icon: "employee" },
    { value: "vacaciones", label: "Vacaciones", icon: "vacation" },
    { value: "ausencias",  label: "Ausencias",  icon: "absences" },
];

export const SCOPE_OPTIONS = [
    { value: "global",   label: "Global",   color: "#C524FF" },
    { value: "house",    label: "Casa",     color: "#7FD447" },
    { value: "personal", label: "Personal", color: "#EFBF22" },
];

export const STATUS_OPTIONS = [
    { value: "aprobadas",  label: "Aprobadas", color: "#1439BA" },
    { value: "en_espera",  label: "En espera", color: "#5673DB" },
];

export const ABSENCE_STATUS_OPTIONS = [
    { value: "no_eliminadas", label: "No eliminadas" },
    { value: "eliminadas", label: "Eliminadas" },
];

export const ABSENCE_EVIDENCE_OPTIONS = [
    { value: "con_evidencia", label: "Con evidencia" },
    { value: "sin_evidencia", label: "Sin evidencia" },
];

export const getFocusOption = (event) => {
    return FOCUS_OPTIONS.find(
        (f) => f.value === event.focus
    );
}

export const getScopeOption = (event) => {
    return SCOPE_OPTIONS.find(
        (s) => s.value === event.scope
    );
}
