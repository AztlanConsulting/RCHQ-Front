import { describe, expect, it } from "vitest";
import { getPersonalEventTitle } from "../../utils/titleGenerator";

describe("titleGenerator", () => {
    it("genera título de ausencia con tipo y nombre del empleado para coordinador", () => {
        expect(
            getPersonalEventTitle(
                {
                    focus: "ausencias",
                    employeeId: "emp-1",
                    name: "Ana López",
                    type: "Médica",
                },
                "Coordinador",
            ),
        ).toBe("Ausencia Médica de Ana López");
    });

    it("genera título de solicitud de vacaciones pendiente para coordinador", () => {
        expect(
            getPersonalEventTitle(
                {
                    focus: "vacaciones",
                    employeeId: "emp-1",
                    name: "Ana López",
                    status: 0,
                },
                "Coordinador",
            ),
        ).toBe("Solicitud de Vacaciones de Ana López");
    });

    it("genera título de vacaciones rechazadas para coordinador", () => {
        expect(
            getPersonalEventTitle(
                {
                    focus: "vacaciones",
                    employeeId: "emp-1",
                    name: "Ana López",
                    status: 2,
                },
                "Coordinador",
            ),
        ).toBe("Vacaciones Rechazadas de Ana López");
    });

    it("genera título de vacaciones aprobadas para coordinador", () => {
        expect(
            getPersonalEventTitle(
                {
                    focus: "vacaciones",
                    employeeId: "emp-1",
                    name: "Ana López",
                    status: 1,
                },
                "Coordinador",
            ),
        ).toBe("Vacaciones de Ana López");
    });

    it("oculta el nombre del empleado para roles no administrativos", () => {
        expect(
            getPersonalEventTitle(
                {
                    focus: "vacaciones",
                    employeeId: "emp-1",
                    name: "Ana López",
                    status: 1,
                },
                "Trabajador",
            ),
        ).toBe("Vacaciones");
    });

    it("regresa el nombre base para eventos sin employeeId", () => {
        expect(
            getPersonalEventTitle({
                focus: "eventos",
                name: "Junta general",
            }),
        ).toBe("Junta general");
    });
});
