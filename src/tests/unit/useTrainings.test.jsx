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
  focus: "eventos",
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

  it("normaliza la fecha canonica y respeta allDay al abrir el detalle", async () => {
    const timedTraining = {
      ...mockTraining,
      date: "2026-06-01T00:00:00.000Z",
      start: "2026-06-01T23:00:00.000Z",
      end: "2026-06-02T01:00:00.000Z",
      allDay: true,
    };
    const { result } = renderHook(() => useTrainings("emp-123"));

    await waitFor(() => {
      expect(result.current.loadingTrainings).toBe(false);
    });

    act(() => {
      result.current.openTrainingDetail(timedTraining);
    });

    expect(result.current.selectedTraining).toMatchObject({
      allDay: true,
      readableStart: "2026-06-01",
      readableEnd: "2026-06-01",
      startDate: "2026-06-01",
      endDate: "2026-06-01",
    });
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
