import { describe, expect, it } from "vitest";
import { generateTimes } from "../../hooks/atoms/useTimeField";

describe("useTimeField", () => {
    it("diferencia medianoche y mediodía en las etiquetas de 12:00", () => {
        const times = generateTimes();

        expect(times.find((time) => time.value === "00:00")).toMatchObject({
            label: "12:00 a.m. (medianoche)",
            value: "00:00",
        });
        expect(times.find((time) => time.value === "12:00")).toMatchObject({
            label: "12:00 p.m. (mediodía)",
            value: "12:00",
        });
    });
});
