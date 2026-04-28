// tests/unit/useDocuments.modal.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDocuments } from "../../hooks/Organism/useDocuments";

// ── Mocks de servicios ──────────────────────────────────────────
vi.mock("../../Services/DocumentService", () => ({
  getDocumentsService: vi.fn().mockResolvedValue({ body: { documents: {} } }),
  uploadDocumentService: vi.fn().mockResolvedValue({}),
  updateDocumentService: vi.fn().mockResolvedValue({}),
  deleteDocumentService: vi.fn().mockResolvedValue({}),
  DOCUMENT_TYPES: [],
}));

// ── Mock token con rol administrador ────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  const payload = btoa(JSON.stringify({ role: "administrador", id: "1" }));
  localStorage.setItem("token", `header.${payload}.sig`);
});

const makeFile = (name = "doc.pdf", type = "application/pdf") =>
  new File(["contenido"], name, { type });

const EMPLOYEE_ID = "emp-123";

// ── Helper: abre el modal de subida ────────────────────────────
const openUploadModal = async (result) => {
  await act(async () => {
    result.current.handleOpenUpload();
  });
};

// ── Helper: abre el modal en modo edición ──────────────────────
const openEditModal = async (result, doc = { type: "cv" }) => {
  await act(async () => {
    result.current.handleOpenEdit(doc);
  });
};

describe("useDocuments — modal: estado inicial", () => {
  it("isEditing=false cuando se abre en modo subida", async () => {
    const { result } = renderHook(() => useDocuments(EMPLOYEE_ID));
    await openUploadModal(result);
    expect(result.current.isEditing).toBe(false);
  });

  it("isEditing=true cuando se abre en modo edición", async () => {
    const { result } = renderHook(() => useDocuments(EMPLOYEE_ID));
    await openEditModal(result);
    expect(result.current.isEditing).toBe(true);
  });

  it("pre-rellena el tipo cuando se edita un documento", async () => {
    const { result } = renderHook(() => useDocuments(EMPLOYEE_ID));
    await openEditModal(result, { type: "nss" });
    expect(result.current.documentType.value).toBe("nss");
  });
});

describe("useDocuments — modal: validaciones al submit", () => {
  it("muestra error si no se selecciona tipo de documento", async () => {
    const { result } = renderHook(() => useDocuments(EMPLOYEE_ID));
    await openUploadModal(result);
    await act(async () => {
      await result.current.handleModalSubmit();
    });
    expect(result.current.displayError).toMatch(/tipo de documento/i);
  });

  it("muestra error si no se selecciona archivo en modo creación", async () => {
    const { result } = renderHook(() => useDocuments(EMPLOYEE_ID));
    await openUploadModal(result);
    act(() => {
      result.current.documentType.handleValue("cv");
    });
    await act(async () => {
      await result.current.handleModalSubmit();
    });
    expect(result.current.displayError).toMatch(/archivo/i);
  });

  it("llama al servicio con FormData válido en modo creación", async () => {
    const { uploadDocumentService } =
      await import("../../Services/DocumentService");
    const { result } = renderHook(() => useDocuments(EMPLOYEE_ID));
    await openUploadModal(result);
    act(() => {
      result.current.documentType.handleValue("cv");
    });
    act(() => {
      result.current.handleFileChange({ target: { files: [makeFile()] } });
    });
    await act(async () => {
      await result.current.handleModalSubmit();
    });
    expect(uploadDocumentService).toHaveBeenCalledTimes(1);
    const formData = uploadDocumentService.mock.calls[0][1];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("documentField")).toBe("cv");
  });

  it("en modo edición permite submit sin archivo", async () => {
    const { updateDocumentService } =
      await import("../../Services/DocumentService");
    const { result } = renderHook(() => useDocuments(EMPLOYEE_ID));
    await openEditModal(result, { type: "cv" });
    await act(async () => {
      await result.current.handleModalSubmit();
    });
    expect(updateDocumentService).toHaveBeenCalledTimes(1);
  });
});
