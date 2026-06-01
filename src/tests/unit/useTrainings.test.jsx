import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTrainings } from "../../hooks/organism/useTrainings";

vi.mock("../../services/trainingService", () => ({
  getTrainingsService: vi.fn(),
}));

vi.mock("../../utils/authStorage", () => ({
  getStoredUser: vi.fn(),
}));

vi.mock("../../utils/timeZone", () => ({
  getBrowserTimeZone: vi.fn(),
}));

import { getTrainingsService } from "../../services/trainingService";
import { getStoredUser } from "../../utils/authStorage";
import { getBrowserTimeZone } from "../../utils/timeZone";

const mockTraining = {
  eventId: "training-001",
  title: "Capacitacion del DIF",
  trainer: "Emilio Santiago Lopez Quinonez",
};

beforeEach(() => {
  vi.clearAllMocks();
  getStoredUser.mockReturnValue({
    role: "Coordinador",
    employeeId: "viewer-001",
  });
  getBrowserTimeZone.mockReturnValue("Europe/Madrid");
  getTrainingsService.mockResolvedValue({
    success: true,
    data: [mockTraining],
  });
});

describe("useTrainings", () => {
  it("carga las capacitaciones al montar el hook y expone el contexto del visor", async () => {
    const { result } = renderHook(() => useTrainings("emp-123"));

    await waitFor(() => {
      expect(result.current.loadingTrainings).toBe(false);
    });

    expect(getTrainingsService).toHaveBeenCalledWith("emp-123");
    expect(result.current.trainings).toEqual([mockTraining]);
    expect(result.current.viewerRole).toBe("Coordinador");
    expect(result.current.ownEmployeeId).toBe("viewer-001");
    expect(result.current.calendarTimeZone).toBe("Europe/Madrid");
  });

  it("no llama al servicio cuando no recibe employeeId", async () => {
    const { result } = renderHook(() => useTrainings(""));

    await waitFor(() => {
      expect(result.current.loadingTrainings).toBe(false);
    });

    expect(getTrainingsService).not.toHaveBeenCalled();
    expect(result.current.trainings).toEqual([]);
  });

  it("guarda y limpia la capacitacion seleccionada", async () => {
    const { result } = renderHook(() => useTrainings("emp-123"));

    await waitFor(() => {
      expect(result.current.loadingTrainings).toBe(false);
    });

    act(() => {
      result.current.openTrainingDetail(mockTraining);
    });

    expect(result.current.selectedTraining).toEqual(mockTraining);

    act(() => {
      result.current.closeTrainingDetail();
    });

    expect(result.current.selectedTraining).toBeNull();
  });

  it("expone el mensaje de error cuando falla la consulta", async () => {
    getTrainingsService.mockRejectedValue(new Error("Error al cargar"));

    const { result } = renderHook(() => useTrainings("emp-123"));

    await waitFor(() => {
      expect(result.current.loadingTrainings).toBe(false);
    });

    expect(result.current.fetchError).toBe("Error al cargar");

    act(() => {
      result.current.clearFetchError();
    });

    expect(result.current.fetchError).toBe("");
  });
});
