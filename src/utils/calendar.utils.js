export const FOCUS_OPTIONS = [
    { value: "eventos",    label: "Eventos",    icon: "key" },
    { value: "vacaciones", label: "Vacaciones", icon: "showEye" },
    { value: "ausencias",  label: "Ausencias",  icon: "hideEye" },
];

export const SCOPE_OPTIONS = [
    { value: "global",   label: "Global",   color: "#C524FF" },
    { value: "house",    label: "Casa",     color: "#7FD447" },
    { value: "personal", label: "Personal", color: "#EFBF22" },
];

export const STATUS_OPTIONS = [
    { value: "aprobadas",  label: "Aprobadas" },
    { value: "en_espera",  label: "En espera" },
    { value: "rechazadas", label: "Rechazadas" },
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