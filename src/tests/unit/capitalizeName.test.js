import { describe, expect, it } from "vitest";

import { capitalizeName } from "../../utils/capitalizeName";

describe("capitalizeName", () => {
    it("capitaliza la primera letra de cada palabra", () => {
        expect(capitalizeName("juan manuel")).toBe("Juan Manuel");
        expect(capitalizeName("lopez")).toBe("Lopez");
    });

    it("conserva espacios al final mientras se escribe", () => {
        expect(capitalizeName("juan ")).toBe("Juan ");
    });

    it("normaliza mayúsculas mixtas", () => {
        expect(capitalizeName("GARCIA")).toBe("Garcia");
    });
});
