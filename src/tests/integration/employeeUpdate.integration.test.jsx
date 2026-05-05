// src/tests/integration/employeeUpdate.integration.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleEmpleado from "../../pages/detalleEmpleado";

// ══════════════════════════════════════════════════════════════════════════════
// Mocks
// ══════════════════════════════════════════════════════════════════════════════

vi.mock("../../services/employeeUpdateService", () => ({
  getUpdateFormService:     vi.fn(),
  updateBasicInfoService:   vi.fn(),
  updateContactInfoService: vi.fn(),
  updateAdminInfoService:   vi.fn(),
}));

vi.mock("../../services/documentService", () => ({
  getDocumentsService:     vi.fn().mockResolvedValue({ success: true, body: null }),
  getDocumentTypesService: vi.fn().mockResolvedValue([]),
  uploadDocumentService:   vi.fn(),
  updateDocumentService:   vi.fn(),
  deleteDocumentService:   vi.fn(),
  DOCUMENT_TYPES:          [],
}));

vi.mock("../../hooks/pages/useEmployeeDetail", () => ({
  useEmployeeDetail: vi.fn(),
}));

vi.mock("../../utils/schema/employee/update.schema", () => ({
  employeeBasicUpdateSchema:   { safeParse: vi.fn((data) => ({ success: true, data })) },
  employeeContactUpdateSchema: { safeParse: vi.fn((data) => ({ success: true, data })) },
  employeeAdminUpdateSchema:   { safeParse: vi.fn((data) => ({ success: true, data })) },
}));

import {
  getUpdateFormService,
  updateBasicInfoService,
  updateContactInfoService,
  updateAdminInfoService,
} from "../../services/employeeUpdateService";
import { useEmployeeDetail } from "../../hooks/pages/useEmployeeDetail";

// ══════════════════════════════════════════════════════════════════════════════
// Fixtures
// ══════════════════════════════════════════════════════════════════════════════

const TEST_EMPLOYEE_ID = "emp-001";

const mockEmployee = {
  employeeId:  TEST_EMPLOYEE_ID,
  name:        "Carlos",
  surname:     "Ramírez",
  email:       "carlos@mail.com",
  phoneNumber: "4421234567",
  role:        "Admin",
  roleId:      "r1",
  houseId:     "h1",
  type:        "tiempo_completo",
  salary:      "15000",
  curp:        "XAXX010101HDFXXX01",
  nss:         null,
  rfc:         null,
  bankAccount: null,
  birthDate:   "2003-10-04T00:00:00.000Z",
  startDate:   "2026-04-09T00:00:00.000Z",
  endDate:     null,
  isActive:    true,
  picture:     null,
};

const mockAddress = {
  street:     "Calle Falsa 123",
  municipio:  "Centro",
  city:       "Querétaro",
  postalCode: "76000",
};

const mockHouse    = { houseId: "h1", name: "Desarrollo" };
const mockWorkdays = [];

// ── setupEmployeeDetail con setAlert reactivo ──────────────────────────────
const setupEmployeeDetail = (overrides = {}) => {
  const mockSetAlert = vi.fn();

  useEmployeeDetail.mockImplementation(() => ({
    employee:                mockEmployee,
    employeeAddress:         mockAddress,
    employeeHouse:           mockHouse,
    employeeFaults:          [],
    employeeWorkdays:        mockWorkdays,
    employeeVacationRequests: [],
    isLoading:               false,
    currentTab:              "overview",
    setCurrentTab:           vi.fn(),
    alert:                   null,
    setAlert:                mockSetAlert,
    getEmployeeDetail:       vi.fn(),
    ...overrides,
    ...(overrides.setAlert ? { setAlert: overrides.setAlert } : { setAlert: mockSetAlert }),
  }));

  return { mockSetAlert };
};

const makeToken = (role = "Admin") => {
  const payload = btoa(JSON.stringify({ id: TEST_EMPLOYEE_ID, role }));
  return `header.${payload}.signature`;
};

const renderPage = () => {
  localStorage.setItem("token", makeToken("Admin"));
  
  return render(
    <MemoryRouter initialEntries={[`/app/personal/${TEST_EMPLOYEE_ID}`]}>
      <Routes>
        <Route path="/app/personal/:employeeId" element={<DetalleEmpleado />} />
      </Routes>
    </MemoryRouter>,
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Setup / teardown
// ══════════════════════════════════════════════════════════════════════════════

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  setupEmployeeDetail();

  getUpdateFormService.mockResolvedValue({
    roles:    [{ roleId: "r1", name: "Admin" }, { roleId: "r2", name: "Coordinador" }],
    houses:   [{ houseId: "h1", name: "Desarrollo" }],
    workdays: [
      { workdayId: "wd1", name: "Lunes" },
      { workdayId: "wd2", name: "Martes" },
    ],
  });
  updateBasicInfoService.mockResolvedValue({ success: true, message: "Información básica actualizada con éxito" });
  updateContactInfoService.mockResolvedValue({ success: true, message: "Información de contacto actualizada con éxito" });
  updateAdminInfoService.mockResolvedValue({ success: true, message: "Información administrativa actualizada con éxito" });
});

// ══════════════════════════════════════════════════════════════════════════════
// Renderizado base
// ══════════════════════════════════════════════════════════════════════════════

describe("DetalleEmpleado — renderizado base", () => {
  it("muestra el nombre del empleado", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Carlos Ramírez")).toBeInTheDocument();
    });
  });

  it("muestra el título de la página", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Gestión de Empleados")).toBeInTheDocument();
    });
  });

  it("muestra el tab Overview por defecto", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    });
  });

  it("muestra las tarjetas de Contacto e Info Administrativa en el tab Overview", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Contacto")).toBeInTheDocument();
      expect(screen.getByText("Información Administrativa")).toBeInTheDocument();
    });
  });

  it("muestra el botón de regreso a personal", async () => {
    renderPage();
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("muestra loader cuando isLoading=true", () => {
    setupEmployeeDetail({ isLoading: true });
    renderPage();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Edición de información básica
// ══════════════════════════════════════════════════════════════════════════════

describe("DetalleEmpleado — editar información básica", () => {
  it("abre el formulario de edición al hacer click en el lápiz de básica", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => {
      expect(screen.getByDisplayValue("Carlos")).toBeInTheDocument();
    });
  });

  it("muestra botones Guardar y Cancelar al editar básica", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });
  });

  it("cancela la edición básica y oculta el formulario", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Cancelar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => {
      expect(screen.queryByDisplayValue("Carlos")).toBeNull();
    });
  });

  it("llama a updateBasicInfoService al guardar cambios básicos", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(updateBasicInfoService).toHaveBeenCalledWith(
        TEST_EMPLOYEE_ID,
        expect.any(Object),
      );
    });
  });

  it("llama a setAlert con mensaje de éxito tras guardar básica", async () => {
    const mockSetAlert = vi.fn();
    setupEmployeeDetail({ setAlert: mockSetAlert });

    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        type: "success",
        message: "Información básica actualizada con éxito",
      });
    });
  });

  it("muestra el error en la tarjeta cuando updateBasicInfoService falla", async () => {
    updateBasicInfoService.mockRejectedValue(
      Object.assign(new Error("Datos inválidos"), { status: 400 }),
    );
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(screen.getByText("Datos inválidos")).toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Edición de información de contacto
// ══════════════════════════════════════════════════════════════════════════════

describe("DetalleEmpleado — editar información de contacto", () => {
  it("abre el formulario de edición de contacto", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar contacto"));
    await waitFor(() => {
      expect(screen.getByDisplayValue("carlos@mail.com")).toBeInTheDocument();
    });
  });

  it("cancela la edición de contacto", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar contacto"));
    await waitFor(() => expect(screen.getByText("Cancelar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => {
      expect(screen.queryByDisplayValue("carlos@mail.com")).toBeNull();
    });
  });

  it("llama a updateContactInfoService al guardar contacto", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar contacto"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    const emailInput = screen.getByDisplayValue("carlos@mail.com");
    fireEvent.change(emailInput, { target: { value: "nuevo@mail.com" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(updateContactInfoService).toHaveBeenCalledWith(
        TEST_EMPLOYEE_ID,
        expect.objectContaining({ email: "nuevo@mail.com" }),
      );
    });
  });

  it("llama a setAlert con mensaje de éxito tras guardar contacto", async () => {
    const mockSetAlert = vi.fn();
    setupEmployeeDetail({ setAlert: mockSetAlert });

    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar contacto"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        type: "success",
        message: "Información de contacto actualizada con éxito",
      });
    });
  });

  it("muestra error en la tarjeta cuando updateContactInfoService falla", async () => {
    updateContactInfoService.mockRejectedValue(
      Object.assign(new Error("Email inválido"), { status: 400 }),
    );
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar contacto"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Edición de información administrativa
// ══════════════════════════════════════════════════════════════════════════════

describe("DetalleEmpleado — editar información administrativa", () => {
  it("abre el formulario de edición administrativa", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });
  });

  it("carga los catálogos de roles y casas al abrir edición admin", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));
    await waitFor(() => {
      expect(getUpdateFormService).toHaveBeenCalledTimes(1);
    });
  });

  it("muestra las opciones de roles después de cargar catálogos", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));

    await waitFor(() => {
      const adminOption = screen.getAllByRole("option", { name: "Admin", hidden: true });
      expect(adminOption.length).toBeGreaterThan(0);

      const coordinadorOption = screen.getByRole("option", { name: "Coordinador", hidden: true });
      expect(coordinadorOption).toBeInTheDocument();
    });
  });

  it("cancela la edición administrativa", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));
    await waitFor(() => expect(screen.getByText("Cancelar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => {
      expect(screen.queryByText("Guardar")).toBeNull();
    });
  });

  it("llama a updateAdminInfoService al guardar admin", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));

    const saveBtn = await screen.findByRole("button", { name: /guardar/i });
    await waitFor(() => expect(saveBtn).not.toBeDisabled());

    const salaryInput = screen.getByPlaceholderText(/Ej: 15000/i);
    fireEvent.change(salaryInput, { target: { value: "20000" } });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(updateAdminInfoService).toHaveBeenCalledWith(
        TEST_EMPLOYEE_ID,
        expect.objectContaining({ salary: 20000 }),
      );
    });
  });

  it("llama a setAlert con mensaje de éxito tras guardar admin", async () => {
    const mockSetAlert = vi.fn();
    setupEmployeeDetail({ setAlert: mockSetAlert });

    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));

    const salaryInput = await screen.findByPlaceholderText(/Ej: 15000/i);
    fireEvent.change(salaryInput, { target: { value: "20000" } });

    const saveBtn = screen.getByRole("button", { name: /guardar/i });
    await waitFor(() => expect(saveBtn).not.toBeDisabled());

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        type: "success",
        message: "Información administrativa actualizada con éxito",
      });
    });
  });

  it("muestra error en la tarjeta cuando updateAdminInfoService falla", async () => {
    updateAdminInfoService.mockRejectedValueOnce(
      Object.assign(new Error("Salario inválido"), { status: 400 }),
    );
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));

    const salaryInput = await screen.findByPlaceholderText(/Ej: 15000/i);
    fireEvent.change(salaryInput, { target: { value: "1" } });

    const saveBtn = screen.getByRole("button", { name: /guardar/i });
    await waitFor(() => expect(saveBtn).not.toBeDisabled());

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(await screen.findByText("Salario inválido")).toBeInTheDocument();
  });

  it("deshabilita Guardar mientras carga catálogos", async () => {
    getUpdateFormService.mockImplementation(
      () => new Promise((resolve) =>
        setTimeout(() => resolve({ roles: [], houses: [], workdays: [] }), 500)
      ),
    );
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));

    const saveBtn = screen.getByText("Guardar").closest("button");
    expect(saveBtn).toBeDisabled();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Aislamiento de secciones de edición
// ══════════════════════════════════════════════════════════════════════════════

describe("DetalleEmpleado — aislamiento de edición", () => {
  it("al abrir básica, no muestra formulario de contacto", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByDisplayValue("Carlos")).toBeInTheDocument());

    expect(screen.queryByDisplayValue("carlos@mail.com")).toBeNull();
  });

  it("al abrir contacto, no muestra formulario básico", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar contacto"));
    await waitFor(() =>
      expect(screen.getByDisplayValue("carlos@mail.com")).toBeInTheDocument()
    );

    expect(screen.queryByDisplayValue("Carlos")).toBeNull();
  });

  it("solo hay un par Guardar/Cancelar activo a la vez", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    expect(screen.getAllByText("Guardar")).toHaveLength(1);
    expect(screen.getAllByText("Cancelar")).toHaveLength(1);
  });
});