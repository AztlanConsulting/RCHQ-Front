import { describe, it, expect } from "vitest";
import {
  countMonFriInRange,
  totalWorkDaysFromApprovedVacationRequests,
} from "../../utils/detalle-empleado.utils";

describe("detalle-empleado.utils", () => {
  describe("countMonFriInRange", () => {
    it("retorna 0 si start es posterior a end", () => {
      expect(
        countMonFriInRange("2024-01-10T00:00:00.000Z", "2024-01-01T00:00:00.000Z"),
      ).toBe(0);
    });

    it("cuenta días de lunes a viernes en un rango (UTC)", () => {
      // 2024-01-01 lun .. 2024-01-07 dom → 5 días laborables
      const n = countMonFriInRange(
        "2024-01-01T00:00:00.000Z",
        "2024-01-07T00:00:00.000Z",
      );
      expect(n).toBe(5);
    });
  });

  describe("totalWorkDaysFromApprovedVacationRequests", () => {
    it("retorna 0 para entradas no array", () => {
      expect(totalWorkDaysFromApprovedVacationRequests(null)).toBe(0);
      expect(totalWorkDaysFromApprovedVacationRequests(undefined)).toBe(0);
    });

    it("ignora solicitudes con status distinto de 1", () => {
      const sum = totalWorkDaysFromApprovedVacationRequests([
        { status: 0, start: "2024-01-01T00:00:00.000Z", end: "2024-01-05T00:00:00.000Z" },
      ]);
      expect(sum).toBe(0);
    });

    it("suma días laborables de solicitudes aprobadas", () => {
      const sum = totalWorkDaysFromApprovedVacationRequests([
        { status: 1, start: "2024-01-01T00:00:00.000Z", end: "2024-01-02T00:00:00.000Z" },
        { status: 1, start: "2024-01-08T00:00:00.000Z", end: "2024-01-08T00:00:00.000Z" },
      ]);
      expect(sum).toBe(3);
    });
  });
});
