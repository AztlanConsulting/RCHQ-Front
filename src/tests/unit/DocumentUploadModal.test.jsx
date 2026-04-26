// tests/unit/useDocumentUploadModal.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDocumentUploadModal } from "../../hooks/Molecules/useDocumentUploadModal";

const makeFile = (name = "doc.pdf", type = "application/pdf") =>
  new File(["contenido"], name, { type });

const baseProps = {
  editingDocument: null,
  isOpen: true,
  onSubmit: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe("useDocumentUploadModal — estado inicial", () => {
  it("isEditing=false cuando editingDocument es null", () => {
    const { result } = renderHook(() => useDocumentUploadModal(baseProps));
    expect(result.current.isEditing).toBe(false);
  });

  it("isEditing=true cuando se pasa editingDocument", () => {
    const { result } = renderHook(() =>
      useDocumentUploadModal({ ...baseProps, editingDocument: { type: "cv" } })
    );
    expect(result.current.isEditing).toBe(true);
  });

  it("pre-rellena el tipo cuando editingDocument tiene type", () => {
    const { result } = renderHook(() =>
      useDocumentUploadModal({ ...baseProps, editingDocument: { type: "nss" } })
    );
    expect(result.current.documentType.value).toBe("nss");
  });
});

describe("useDocumentUploadModal — validaciones al submit", () => {
  it("muestra error si no se selecciona tipo de documento", () => {
    const { result } = renderHook(() => useDocumentUploadModal(baseProps));
    act(() => {
      result.current.handleSubmit();
    });
    expect(result.current.displayError).toMatch(/tipo de documento/i);
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it("muestra error si no se selecciona archivo en modo creación", () => {
    const { result } = renderHook(() => useDocumentUploadModal(baseProps));
    act(() => {
      result.current.documentType.handleValue("cv");
    });
    act(() => {
      result.current.handleSubmit();
    });
    expect(result.current.displayError).toMatch(/archivo/i);
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it("llama a onSubmit con FormData cuando los datos son válidos", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useDocumentUploadModal({ ...baseProps, onSubmit })
    );
    act(() => {
      result.current.documentType.handleValue("cv");
    });
    act(() => {
      result.current.handleFileChange({
        target: { files: [makeFile()] },
      });
    });
    act(() => {
      result.current.handleSubmit();
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const formData = onSubmit.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("documentField")).toBe("cv");
  });

  it("en modo edición permite submit sin archivo", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useDocumentUploadModal({
        ...baseProps,
        onSubmit,
        editingDocument: { type: "cv" },
      })
    );
    act(() => {
      result.current.handleSubmit();
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});