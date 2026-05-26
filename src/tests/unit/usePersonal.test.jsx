import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePersonal from "../../hooks/pages/usePersonal";
import { useEmployees } from "../../hooks/pages/useGetAllEmployees";
import { useGetBlacklist } from "../../hooks/pages/useGetBlacklist";

vi.mock("../../hooks/pages/useGetAllEmployees", () => ({
  useEmployees: vi.fn(),
}));

vi.mock("../../hooks/pages/useGetBlacklist", () => ({
  useGetBlacklist: vi.fn(),
}));

describe("usePersonal", () => {
  const employeesState = {
    employees: [{ employeeId: "1", fullName: "Juan Perez" }],
    pagination: { total: 1, totalPages: 1 },
    loading: false,
    error: null,
    page: 1,
    searchQuery: "",
    setSearchQuery: vi.fn(),
    activeFilter: "true",
    setActiveFilter: vi.fn(),
    handleNextPage: vi.fn(),
    handlePrevPage: vi.fn(),
    refresh: vi.fn(),
  };

  const blacklistState = {
    employees: [{ employeeId: "2", fullName: "Maria Gomez", isBlacklisted: true }],
    pagination: { total: 1, totalPages: 1 },
    loading: false,
    error: null,
    page: 1,
    searchQuery: "",
    setSearchQuery: vi.fn(),
    isBlacklistedFilter: undefined,
    setIsBlacklistedFilter: vi.fn(),
    handleNextPage: vi.fn(),
    handlePrevPage: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useEmployees.mockImplementation(() => employeesState);
    useGetBlacklist.mockImplementation(() => blacklistState);
  });

  it("habilita solo la consulta de empleados al iniciar", () => {
    const { result } = renderHook(() => usePersonal());

    expect(useEmployees).toHaveBeenCalledWith({ enabled: true });
    expect(useGetBlacklist).toHaveBeenCalledWith({ enabled: false });
    expect(result.current.activeEmployees).toEqual(employeesState.employees);
  });

  it("al cambiar a lista negra habilita solo esa consulta", () => {
    const { result, rerender } = renderHook(() => usePersonal());

    act(() => {
      result.current.handleToggleBlacklistMode();
    });

    rerender();

    expect(useEmployees).toHaveBeenLastCalledWith({ enabled: false });
    expect(useGetBlacklist).toHaveBeenLastCalledWith({ enabled: true });
    expect(result.current.isBlacklistMode).toBe(true);
    expect(result.current.activeEmployees).toEqual(blacklistState.employees);
  });
});
