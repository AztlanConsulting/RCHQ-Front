import { describe, expect, it } from "vitest";
import { getPersonalEventTitle } from "../../utils/titleGenerator";

describe("titleGenerator", () => {
    it("genera título de ausencia con tipo y nombre del empleado", () => {
        expect(
            getPersonalEventTitle({
                focus: "ausencias",
                employeeId: "emp-1",
                name: "Ana López",
                type: "Médica",
            }),
        ).toBe("Ausencia Médica de Ana López");
    });

    it("genera título de solicitud de vacaciones pendiente", () => {
        expect(
            getPersonalEventTitle({
                focus: "vacaciones",
                employeeId: "emp-1",
                name: "Ana López",
                status: 0,
            }),
        ).toBe("Solicitud de Vacaciones de Ana López");
    });

    it("genera título de vacaciones rechazadas", () => {
        expect(
            getPersonalEventTitle({
                focus: "vacaciones",
                employeeId: "emp-1",
                name: "Ana López",
                status: 2,
            }),
        ).toBe("Vacaciones Rechazadas de Ana López");
    });

    it("genera título de vacaciones aprobadas", () => {
        expect(
            getPersonalEventTitle({
                focus: "vacaciones",
                employeeId: "emp-1",
                name: "Ana López",
                status: 1,
            }),
        ).toBe("Vacación de Ana López");
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
