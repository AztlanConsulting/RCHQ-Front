// tests/unit/DocumentService.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDocumentsService,
  uploadDocumentService,
  updateDocumentService,
  deleteDocumentService,
  DOCUMENT_TYPES,
} from "../../Services/DocumentService";

const mockFetch = (body, ok = true, status = 200) => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("DOCUMENT_TYPES", () => {
  it("contiene al menos el tipo 'cv'", () => {
    expect(DOCUMENT_TYPES.find((d) => d.value === "cv")).toBeDefined();
  });

  it("cada tipo tiene value y label", () => {
    DOCUMENT_TYPES.forEach((dt) => {
      expect(dt).toHaveProperty("value");
      expect(dt).toHaveProperty("label");
    });
  });
});

describe("getDocumentsService", () => {
  it("lanza error si no hay token en localStorage", async () => {
    await expect(getDocumentsService("emp-123")).rejects.toThrow(
      "No se encontró token de sesión"
    );
  });

  it("retorna los documentos cuando la respuesta es exitosa", async () => {
    localStorage.setItem("token", "valid-token");
    const apiResponse = { body: { documents: { cv: "uploads/cv.pdf" } } };
    mockFetch(apiResponse);
    const result = await getDocumentsService("emp-123");
    expect(result).toEqual(apiResponse);
  });

  it("hace GET al endpoint correcto con Authorization header", async () => {
    localStorage.setItem("token", "my-token");
    mockFetch({ body: {} });
    await getDocumentsService("emp-456");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/employee/emp-456/documents"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer my-token" }),
      })
    );
  });

  it("lanza error con status cuando la respuesta no es ok", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "No autorizado" }, false, 401);
    await expect(getDocumentsService("emp-123")).rejects.toMatchObject({
      message: "No autorizado",
      status: 401,
    });
  });
});

describe("uploadDocumentService", () => {
  it("lanza error si no hay token", async () => {
    await expect(uploadDocumentService("emp-123", new FormData())).rejects.toThrow(
      "No se encontró token de sesión"
    );
  });

  it("hace POST al endpoint correcto", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ success: true });
    const formData = new FormData();
    await uploadDocumentService("emp-123", formData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/employee/emp-123/documents"),
      expect.objectContaining({ method: "POST", body: formData })
    );
  });

  it("retorna la respuesta exitosa del servidor", async () => {
    localStorage.setItem("token", "valid-token");
    const apiResponse = { success: true, message: "Documento subido" };
    mockFetch(apiResponse);
    const result = await uploadDocumentService("emp-123", new FormData());
    expect(result).toEqual(apiResponse);
  });

  it("lanza error con status 400 cuando faltan campos", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "Faltan campos requeridos" }, false, 400);
    await expect(uploadDocumentService("emp-123", new FormData())).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe("updateDocumentService", () => {
  it("lanza error si no hay token", async () => {
    await expect(updateDocumentService("emp-123", "cv", new FormData())).rejects.toThrow(
      "No se encontró token de sesión"
    );
  });

  it("hace PUT al endpoint con el field correcto", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ success: true });
    const formData = new FormData();
    await updateDocumentService("emp-123", "cv", formData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/employee/emp-123/documents/cv"),
      expect.objectContaining({ method: "PUT", body: formData })
    );
  });

  it("retorna la respuesta del servidor al actualizar", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ success: true, message: "Actualizado" });
    const result = await updateDocumentService("emp-123", "cv", new FormData());
    expect(result.success).toBe(true);
  });
});

describe("deleteDocumentService", () => {
  it("lanza error si no hay token", async () => {
    await expect(deleteDocumentService("emp-123", "cv")).rejects.toThrow(
      "No se encontró token de sesión"
    );
  });

  it("hace DELETE al endpoint con el field correcto", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ success: true });
    await deleteDocumentService("emp-123", "cv");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/employee/emp-123/documents/cv"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("lanza error con status 404 cuando el documento no existe", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "Documento no encontrado" }, false, 404);
    await expect(deleteDocumentService("emp-123", "cv")).rejects.toMatchObject({
      status: 404,
    });
  });
});