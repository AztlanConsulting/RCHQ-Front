import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedVacationSearch } from "../../hooks/molecules/useDebouncedVacationSearch";

describe("useDebouncedVacationSearch", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it("inicializa inputValue y debouncedSearch con el valor inicial", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch("ana"));

        expect(result.current.inputValue).toBe("ana");
        expect(result.current.debouncedSearch).toBe("ana");
    });

    it("actualiza inputValue inmediatamente al escribir", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch(""));

        act(() => {
            result.current.setInputValue("ana");
        });

        expect(result.current.inputValue).toBe("ana");
        expect(result.current.debouncedSearch).toBe("");
    });

    it("actualiza debouncedSearch después del debounce cuando la búsqueda tiene al menos 2 caracteres", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch(""));

        act(() => {
            result.current.setInputValue("ana");
        });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current.debouncedSearch).toBe("ana");
    });

    it("normaliza espacios antes de actualizar debouncedSearch", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch(""));

        act(() => {
            result.current.setInputValue("  ana    pendiente  ");
        });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current.debouncedSearch).toBe("ana pendiente");
    });

    it("limpia debouncedSearch cuando el valor queda vacío", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch("ana"));

        act(() => {
            result.current.setInputValue("");
        });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current.debouncedSearch).toBe("");
    });

    it("limpia debouncedSearch cuando la búsqueda tiene menos de 2 caracteres", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch("ana"));

        act(() => {
            result.current.setInputValue("a");
        });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current.debouncedSearch).toBe("");
    });

    it("clearSearch limpia inputValue y debouncedSearch inmediatamente", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch("ana"));

        act(() => {
            result.current.clearSearch();
        });

        expect(result.current.inputValue).toBe("");
        expect(result.current.debouncedSearch).toBe("");
    });

    it("solo usa el último valor escrito dentro del debounce", () => {
        const { result } = renderHook(() => useDebouncedVacationSearch(""));

        act(() => {
            result.current.setInputValue("us9");
        });

        act(() => {
            vi.advanceTimersByTime(100);
        });

        act(() => {
            result.current.setInputValue("us");
        });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current.debouncedSearch).toBe("us");
    });
});
