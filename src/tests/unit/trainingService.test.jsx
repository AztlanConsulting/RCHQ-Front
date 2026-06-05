import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTrainingsService } from "../../services/trainingService";
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

const trainingFromApi = {
  eventId: "training-001",
  name: "Capacitacion del DIF",
  type: "Capacitaciones",
  focus: "eventos",
  focusLabel: "Eventos",
  scope: "personal",
  scopeLabel: "Personal",
  date: "2026-05-27T00:00:00.000Z",
  start: "2026-05-27T12:30:00.000Z",
  end: "2026-05-27T14:00:00.000Z",
  trainer: "Emilio Santiago Lopez Quinonez",
  description: "Sesion interna",
  color: "#D58936",
  peopleInsideEvent: [
    { id: "emp-1", name: "Manuel Bajos Rivera" },
    { id: "emp-2", name: "Santiago Jimenez Palazuelos" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTrainingsService", () => {
  it("hace GET al endpoint correcto y mapea las capacitaciones", async () => {
    mockFetch({
      success: true,
      data: {
        trainings: [trainingFromApi],
      },
    });

    const result = await getTrainingsService("emp-123");

    expect(secureFetch).toHaveBeenCalledWith("/event/trainings/emp-123");
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      eventId: "training-001",
      title: "Capacitacion del DIF",
      eventType: "Capacitaciones",
      trainer: "Emilio Santiago Lopez Quinonez",
      peopleInsideEvent: trainingFromApi.peopleInsideEvent,
    });
  });

  it("regresa un arreglo vacio cuando la API no trae capacitaciones", async () => {
    mockFetch({
      success: true,
      data: {},
    });

    const result = await getTrainingsService("emp-123");

    expect(result.data).toEqual([]);
  });

  it("lanza error con status y mensaje cuando la respuesta no es ok", async () => {
    mockFetch({ message: "No autorizado" }, false, 401);

    await expect(getTrainingsService("emp-123")).rejects.toMatchObject({
      message: "No autorizado",
      status: 401,
    });
  });
});
