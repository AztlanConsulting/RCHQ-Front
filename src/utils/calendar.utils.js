export const FOCUS_OPTIONS = [
    { value: "eventos",    label: "Eventos",    icon: "employee" },
    { value: "vacaciones", label: "Vacaciones", icon: "vacation" },
    { value: "ausencias",  label: "Ausencias",  icon: "absences" },
];

export const SCOPE_OPTIONS = [
    { value: "global", label: "Global", color: "#B66897" },
    { value: "house", label: "Casa", color: "#307351" },
    { value: "personal", label: "Personal", color: "#D58936" },
];

export const STATUS_OPTIONS = [
    { value: "aprobadas", label: "Aprobadas", color: "#203766" },
    { value: "en_espera", label: "En espera", color: "#6298C7" },
];

export const ABSENCE_STATUS_OPTIONS = [
    { value: "no_eliminadas", label: "No eliminadas", color: "#A8201A" },
    { value: "eliminadas", label: "Eliminadas", color: "#3E000C" },
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
