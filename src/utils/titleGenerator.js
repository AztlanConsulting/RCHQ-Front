export const getPersonalEventTitle = (event) => {
    const rawName = String(event.title ?? event.name ?? "").trim();
    const rawType = String(event.type ?? "").trim();

    if (event.employeeId) {
        if (event.focus === "ausencias") {
            return `Ausencia ${rawType} de ${rawName}`
        }

        if (event.focus === "vacaciones") { 
            return `Vacación de ${rawName}`
        }

        return rawName;
    }

    return rawName;
};