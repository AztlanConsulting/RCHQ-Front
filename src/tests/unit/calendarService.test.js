import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../utils/secureFetchWrapper", () => ({
  secureFetch: vi.fn(),
}));

import { secureFetch } from "../../utils/secureFetchWrapper";

describe("calendarService", () => {
  let buildAbsenceEvidenceUrl;
  let updateAbsenceService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubEnv("VITE_API_URL", "http://api.test");
  });

  const loadService = async () => {
    ({ buildAbsenceEvidenceUrl, updateAbsenceService } = await import(
      "../../services/calendarService"
    ));
  };

  it("envía JSON cuando solo se actualizan campos de la ausencia", async () => {
    await loadService();
    localStorage.setItem("token", "token-test");
    secureFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: { absence: { absenceId: "absence-1" } },
      }),
    });

    await updateAbsenceService("absence-1", {
      description: "Nueva descripción",
    });

    expect(secureFetch).toHaveBeenCalledWith(
      "http://api.test/absence/absence-1",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer token-test",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ description: "Nueva descripción" }),
      }),
    );
  });

  it("envía FormData cuando se actualiza la evidencia", async () => {
    await loadService();
    localStorage.setItem("token", "token-test");
    secureFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: { absence: { absenceId: "absence-1" } },
      }),
    });

    const file = new File(["pdf"], "evidencia.pdf", {
      type: "application/pdf",
    });

    await updateAbsenceService("absence-1", {
      description: "Nueva descripción",
      file,
    });

    expect(secureFetch).toHaveBeenCalledWith(
      "http://api.test/absence/absence-1",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer token-test",
        }),
        body: expect.any(FormData),
      }),
    );

    const requestBody = secureFetch.mock.calls[0][1].body;
    expect(requestBody.get("description")).toBe("Nueva descripción");
    expect(requestBody.get("file")).toBe(file);
  });

  it("conserva strings vacíos en FormData para permitir limpiar campos", async () => {
    await loadService();
    localStorage.setItem("token", "token-test");
    secureFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: { absence: { absenceId: "absence-1" } },
      }),
    });

    const file = new File(["pdf"], "evidencia.pdf", {
      type: "application/pdf",
    });

    await updateAbsenceService("absence-1", {
      description: "",
      file,
    });

    const requestBody = secureFetch.mock.calls[0][1].body;
    expect(requestBody.get("description")).toBe("");
    expect(requestBody.get("file")).toBe(file);
  });

  it("anida la URL relativa de evidencia con el API_URL", async () => {
    await loadService();
    expect(buildAbsenceEvidenceUrl("uploads/documents/test.pdf")).toBe(
      "http://api.test/uploads/documents/test.pdf",
    );
  });

  it("no modifica una URL absoluta de evidencia", async () => {
    await loadService();
    expect(buildAbsenceEvidenceUrl("https://cdn.test/evidencia.pdf")).toBe(
      "https://cdn.test/evidencia.pdf",
    );
  });
});
