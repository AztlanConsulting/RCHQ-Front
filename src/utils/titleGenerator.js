export const getPersonalEventTitle = (event, viewerRole) => {
    const rawName = String(event.title ?? event.name ?? "").trim();
    const rawType = String(event.type ?? "").trim();

    const seesManyPeople = ["administrador", "coordinador"].includes(viewerRole.toLowerCase());

    const linkUserText = seesManyPeople ? ` de ${rawName}` : "";

    if (event.employeeId) {
        if (event.focus === "ausencias") {
            return `Ausencia ${rawType}${linkUserText}`
        }

        if (event.focus === "vacaciones") { 
            return `Vacación${linkUserText}`
        }

        return rawName;
    }

    return rawName;
};