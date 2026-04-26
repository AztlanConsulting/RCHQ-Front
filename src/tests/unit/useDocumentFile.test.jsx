// tests/unit/useDocumentFile.test.js
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDocumentFile } from "../../hooks/Atoms/useDocumentFile";

const makeFile = (name, type, size = 1000) => {
  const file = new File(["x".repeat(size)], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("useDocumentFile", () => {
  it("inicia con file=null, fileName='' y error=''", () => {
    const { result } = renderHook(() => useDocumentFile());
    expect(result.current.file).toBeNull();
    expect(result.current.fileName).toBe("");
    expect(result.current.error).toBe("");
  });

  it("acepta un PDF válido y lo guarda", () => {
    const { result } = renderHook(() => useDocumentFile());
    const file = makeFile("doc.pdf", "application/pdf");
    act(() => {
      result.current.handleFileChange({ target: { files: [file] } });
    });
    expect(result.current.file).toBe(file);
    expect(result.current.fileName).toBe("doc.pdf");
    expect(result.current.error).toBe("");
  });

  it("acepta una imagen PNG válida", () => {
    const { result } = renderHook(() => useDocumentFile());
    const file = makeFile("foto.png", "image/png");
    act(() => {
      result.current.handleFileChange({ target: { files: [file] } });
    });
    expect(result.current.file).toBe(file);
    expect(result.current.error).toBe("");
  });

  it("rechaza un tipo no permitido y muestra error", () => {
    const { result } = renderHook(() => useDocumentFile());
    const file = makeFile("virus.exe", "application/x-msdownload");
    act(() => {
      result.current.handleFileChange({ target: { files: [file] } });
    });
    expect(result.current.file).toBeNull();
    expect(result.current.error).toMatch(/pdf, png o jpg/i);
  });

  it("rechaza un archivo que supera 10 MB", () => {
    const { result } = renderHook(() => useDocumentFile());
    const file = makeFile("grande.pdf", "application/pdf", 11 * 1024 * 1024);
    act(() => {
      result.current.handleFileChange({ target: { files: [file] } });
    });
    expect(result.current.file).toBeNull();
    expect(result.current.error).toMatch(/10 mb/i);
  });

  it("no hace nada si no hay archivo seleccionado", () => {
    const { result } = renderHook(() => useDocumentFile());
    act(() => {
      result.current.handleFileChange({ target: { files: [] } });
    });
    expect(result.current.file).toBeNull();
    expect(result.current.fileName).toBe("");
  });

  it("resetea el estado al llamar reset()", () => {
    const { result } = renderHook(() => useDocumentFile());
    const file = makeFile("doc.pdf", "application/pdf");
    act(() => {
      result.current.handleFileChange({ target: { files: [file] } });
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.file).toBeNull();
    expect(result.current.fileName).toBe("");
    expect(result.current.error).toBe("");
  });
});