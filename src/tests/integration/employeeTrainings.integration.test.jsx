import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleEmpleado from "../../pages/detalleEmpleado";

vi.mock("../../services/employeeUpdateService", () => ({
  getUpdateFormService: vi.fn(),
  updateBasicInfoService: vi.fn(),
  updateContactInfoService: vi.fn(),
  updateAdminInfoService: vi.fn(),
}));

vi.mock("../../services/documentService", () => ({
  getDocumentsService: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getDocumentTypesService: vi.fn().mockResolvedValue([]),
  uploadDocumentService: vi.fn(),
  updateDocumentService: vi.fn(),
  deleteDocumentService: vi.fn(),
  DOCUMENT_TYPES: [],
}));

vi.mock("../../services/trainingService", () => ({
  getTrainingsService: vi.fn(),
}));

vi.mock("../../hooks/pages/useEmployeeDetail", () => ({
  useEmployeeDetail: vi.fn(),
}));

vi.mock("../../utils/schema/employee/update.schema", () => ({
  employeeBasicUpdateSchema: { safeParse: vi.fn((data) => ({ success: true, data })) },
  employeeContactUpdateSchema: { safeParse: vi.fn((data) => ({ success: true, data })) },
  employeeAdminUpdateSchema: { safeParse: vi.fn((data) => ({ success: true, data })) },
  normalizeEmployeeContractType: vi.fn((value) => value),
}));

import { useEmployeeDetail } from "../../hooks/pages/useEmployeeDetail";
import { getTrainingsService } from "../../services/trainingService";

const TEST_EMPLOYEE_ID = "emp-001";

const mockEmployee = {
  employeeId: TEST_EMPLOYEE_ID,
  name: "Carlos",
  surname: "Ramirez",
  role: "Cuidador",
  houseId: "h1",
  isActive: true,
  picture: null,
};

const setupEmployeeDetail = (overrides = {}) => {
  useEmployeeDetail.mockImplementation(() => ({
    employee: mockEmployee,
    employeeAddress: null,
    employeeHouse: { houseId: "h1", name: "Desarrollo" },
    employeeWorkdays: [],
    employeeVacationRequests: [],
    employeeAbsenceUsedDays: 0,
    isLoading: false,
    currentTab: "expediente",
    setCurrentTab: vi.fn(),
    alert: null,
    setAlert: vi.fn(),
    getEmployeeDetail: vi.fn(),
    ...overrides,
  }));
};

const makeToken = (role = "Administrador") => {
  const payload = btoa(JSON.stringify({ id: TEST_EMPLOYEE_ID, role }));
  return `header.${payload}.signature`;
};

const renderPage = (role = "Coordinador") => {
  localStorage.setItem("token", makeToken("Administrador"));
  localStorage.setItem(
    "user",
    JSON.stringify({ role, employeeId: TEST_EMPLOYEE_ID }),
  );

  return render(
    <MemoryRouter initialEntries={[`/app/personal/${TEST_EMPLOYEE_ID}`]}>
      <Routes>
        <Route path="/app/personal/:employeeId" element={<DetalleEmpleado />} />
      </Routes>
    </MemoryRouter>,
  );
};

const buildTraining = (overrides = {}) => ({
  eventId: "training-001",
  title: "Capacitacion del DIF",
  date: "2026-05-27T00:00:00.000Z",
  start: "2026-05-27T12:30:00.000Z",
  end: "2026-05-27T14:00:00.000Z",
  scope: "personal",
  scopeLabel: "Personal",
  focus: "eventos",
  focusLabel: "Eventos",
  eventType: "Capacitaciones",
  trainer: "Emilio Santiago Lopez Quinonez",
  description: "Sesion interna",
  backgroundColor: "#D58936",
  borderColor: "#D58936",
  peopleInsideEvent: [
    { id: "emp-1", name: "Manuel Bajos Rivera" },
    { id: "emp-2", name: "Santiago Jimenez Palazuelos" },
    { id: "emp-3", name: "Ernesto Villafranco Ozuna" },
    { id: "emp-4", name: "Emilio Santiago Lopez Quinonez" },
  ],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  setupEmployeeDetail();
  getTrainingsService.mockResolvedValue({ success: true, data: [] });
});

describe("DetalleEmpleado - capacitaciones", () => {
  it("coordinador ve las capacitaciones del empleado y no ve botones de accion", async () => {
    getTrainingsService.mockResolvedValue({
      success: true,
      data: [buildTraining()],
    });

    renderPage("Coordinador");

    const trainingCard = await screen.findByRole("button", {
      name: /capacitacion del dif/i,
    });
    fireEvent.click(trainingCard);

    await waitFor(() => {
      expect(screen.getByText("Detalle del evento")).toBeInTheDocument();
    });

    const detailRoot = screen.getByText("Detalle del evento").parentElement;

    expect(
      screen.getByText("Empleados ligados al evento:"),
    ).toBeInTheDocument();
    expect(screen.getByText("Manuel Bajos Rivera")).toBeInTheDocument();
    expect(
      screen.getByText("Santiago Jimenez Palazuelos"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ernesto Villafranco Ozuna"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Emilio Santiago Lopez Quinonez").length,
    ).toBeGreaterThan(0);
    expect(
      within(detailRoot).queryByRole("button", { name: /editar/i }),
    ).not.toBeInTheDocument();
    expect(
      within(detailRoot).queryByRole("button", { name: /eliminar/i }),
    ).not.toBeInTheDocument();
  });

  it("administrador ve todas las capacitaciones del empleado y no ve botones de accion", async () => {
    getTrainingsService.mockResolvedValue({
      success: true,
      data: [
        buildTraining(),
        buildTraining({
          eventId: "training-002",
          title: "Capacitacion de seguridad",
        }),
      ],
    });

    renderPage("Administrador");

    await waitFor(() => {
      expect(screen.getByText("Capacitacion del DIF")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Capacitacion de seguridad"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /capacitacion de seguridad/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Detalle del evento")).toBeInTheDocument();
    });

    const detailRoot = screen.getByText("Detalle del evento").parentElement;

    expect(
      within(detailRoot).queryByRole("button", { name: /editar/i }),
    ).not.toBeInTheDocument();
    expect(
      within(detailRoot).queryByRole("button", { name: /eliminar/i }),
    ).not.toBeInTheDocument();
  });
});
