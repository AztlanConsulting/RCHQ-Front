export const getPersonalEventTitle = (event, viewerRole = "") => {
    const rawName = String(event.title ?? event.name ?? "").trim();
    const rawType = String(event.type ?? "").trim();

    const seesManyPeople = ["administrador", "coordinador"].includes(
        String(viewerRole).toLowerCase(),
    );

    const linkUserText = seesManyPeople && rawName ? ` de ${rawName}` : "";

    if (event.employeeId) {
        if (event.focus === "ausencias") {
            return `Ausencia ${rawType}${linkUserText}`;
        }

        if (event.focus === "vacaciones") {
            const status = Number(event.status);

            if (status === 0) {
                return `Solicitud de Vacaciones${linkUserText}`;
            }

            if (status === 2) {
                return `Vacaciones Rechazadas${linkUserText}`;
            }

            return `Vacaciones${linkUserText}`;
        }

        return rawName;
    }

    return rawName;
};