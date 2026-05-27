import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDocumentTypesService,
  getDocumentsService,
  uploadDocumentService,
  updateDocumentService,
  deleteDocumentService,
} from "../../services/documentService";
import { secureFetch } from "../../utils/secureFetchWrapper";

vi.mock("../../utils/secureFetchWrapper", () => ({
  secureFetch: vi.fn(),
}));

const mockFetch = (body, ok = true, status = 200) => {
  secureFetch.mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("getDocumentTypesService", () => {
  it("retorna los tipos de documento mapeados cuando la respuesta es exitosa", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({
      data: [
        { document_id: "uuid-1", name: "Curriculum Vitae" },
        { document_id: "uuid-2", name: "NSS" },
      ],
    });
    const result = await getDocumentTypesService();
    expect(result).toEqual([
      { value: "uuid-1", label: "Curriculum Vitae" },
      { value: "uuid-2", label: "NSS" },
    ]);
  });

  it("hace GET al endpoint correcto", async () => {
    mockFetch({ data: [] });
    await getDocumentTypesService();
    expect(secureFetch).toHaveBeenCalledWith(expect.stringContaining("/employee/document-types"));
  });

  it("lanza error cuando la respuesta no es ok", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "No autorizado" }, false, 401);
    await expect(getDocumentTypesService()).rejects.toMatchObject({
      message: "No autorizado",
      status: 401,
    });
  });
});

describe("getDocumentsService", () => {
  it("retorna los documentos con URL completa cuando la respuesta es exitosa", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({
      success: true,
      data: [{ document_id: "doc-1", url: "uploads/documents/cv.pdf" }],
    });
    const result = await getDocumentsService("emp-123");
    expect(result.data[0].url).toContain("uploads/documents/cv.pdf");
  });

  it("hace GET al endpoint correcto", async () => {
    mockFetch({ data: [] });
    await getDocumentsService("emp-456");
    expect(secureFetch).toHaveBeenCalledWith(expect.stringContaining("/employee/emp-456/documents"));
  });

  it("lanza error con status cuando la respuesta no es ok", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "No autorizado" }, false, 401);
    await expect(getDocumentsService("emp-123")).rejects.toMatchObject({
      message: "No autorizado",
      status: 401,
    });
  });

  it("maneja data undefined en la respuesta sin romper", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ success: true, data: undefined });
    const result = await getDocumentsService("emp-123");
    expect(result.data).toBeUndefined();
  });
});

describe("uploadDocumentService", () => {
  it("hace POST al endpoint correcto", async () => {
    mockFetch({ success: true });
    const formData = new FormData();
    await uploadDocumentService("emp-123", formData);
    expect(secureFetch).toHaveBeenCalledWith(
      expect.stringContaining("/employee/emp-123/documents"),
      expect.objectContaining({
        method: "POST",
        body: formData,
      }),
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
    await expect(
      uploadDocumentService("emp-123", new FormData()),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("lanza error con status 409 cuando el documento ya existe", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "Ya existe un documento para ese campo", field: "cv" }, false, 409);
    const error = await uploadDocumentService("emp-123", new FormData()).catch((e) => e);
    expect(error.status).toBe(409);
    expect(error.field).toBe("cv");
  });
});

describe("updateDocumentService", () => {
  it("hace PUT al endpoint con el field correcto", async () => {
    mockFetch({ success: true });
    const formData = new FormData();
    await updateDocumentService("emp-123", "cv", formData);
    expect(secureFetch).toHaveBeenCalledWith(
      expect.stringContaining("/employee/emp-123/documents/cv"),
      expect.objectContaining({
        method: "PUT",
        body: formData,
      }),
    );
  });

  it("retorna la respuesta del servidor al actualizar", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ success: true, message: "Actualizado" });
    const result = await updateDocumentService("emp-123", "cv", new FormData());
    expect(result.success).toBe(true);
  });

  it("lanza error cuando la respuesta no es ok", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "Documento no encontrado" }, false, 404);
    await expect(
      updateDocumentService("emp-123", "cv", new FormData()),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe("deleteDocumentService", () => {
  it("hace DELETE al endpoint con el field correcto", async () => {
    mockFetch({ success: true });
    await deleteDocumentService("emp-123", "cv");
    expect(secureFetch).toHaveBeenCalledWith(
      expect.stringContaining("/employee/emp-123/documents/cv"),
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });

  it("retorna la respuesta exitosa al eliminar", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ success: true, message: "Documento eliminado" });
    const result = await deleteDocumentService("emp-123", "cv");
    expect(result.success).toBe(true);
  });

  it("lanza error con status 404 cuando el documento no existe", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch({ message: "Documento no encontrado" }, false, 404);
    await expect(deleteDocumentService("emp-123", "cv")).rejects.toMatchObject({
      status: 404,
    });
  });
});