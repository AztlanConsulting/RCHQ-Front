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
  getUpdateFormService:      vi.fn(),
  updateBasicInfoService:    vi.fn(),
  updateContactInfoService:  vi.fn(),
  updateAdminInfoService:    vi.fn(),
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

const makeToken = (role = "Admin") => {
  const payload = btoa(JSON.stringify({ id: TEST_EMPLOYEE_ID, role }));
  return `header.${payload}.signature`;
};

const setupEmployeeDetail = (overrides = {}) => {
  useEmployeeDetail.mockReturnValue({
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
    setAlert:                vi.fn(),
    getEmployeeDetail:       vi.fn(),
    ...overrides,
  });
};

const renderPage = () => {
  localStorage.setItem("token", makeToken());

  // Si el tab no es "overview" necesitamos que setCurrentTab actualice el estado
  // Lo hacemos wrapping con un componente que maneje el tab
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
  updateBasicInfoService.mockResolvedValue({ success: true, message: "Información básica actualizada" });
  updateContactInfoService.mockResolvedValue({ success: true, message: "Contacto actualizado" });
  updateAdminInfoService.mockResolvedValue({ success: true, message: "Información administrativa actualizada" });
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
      expect(screen.getByText("Overview")).toBeInTheDocument();
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
      expect(screen.getByRole("button", { name: /volver/i })).toBeInTheDocument();
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
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
    await waitFor(() => {
      expect(screen.getByDisplayValue("Carlos")).toBeInTheDocument();
    });
  });

  it("muestra botones Guardar y Cancelar al editar básica", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });
  });

  it("cancela la edición básica y oculta el formulario", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Cancelar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => {
      expect(screen.queryByDisplayValue("Carlos")).toBeNull();
    });
  });

  it("llama a updateBasicInfoService al guardar cambios básicos", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
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

  it("muestra alerta de éxito tras guardar básica", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });
    await waitFor(() => {
      expect(
        screen.getByText("Información básica actualizada"),
      ).toBeInTheDocument();
    });
  });

  it("muestra el error cuando updateBasicInfoService falla", async () => {
    updateBasicInfoService.mockRejectedValue(
      Object.assign(new Error("Datos inválidos"), { status: 400 }),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
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
    await waitFor(() =>
      expect(screen.getByLabelText("Editar contacto")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar contacto"));
    await waitFor(() => {
      expect(screen.getByDisplayValue("carlos@mail.com")).toBeInTheDocument();
    });
  });

  it("cancela la edición de contacto", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar contacto")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar contacto"));
    await waitFor(() => expect(screen.getByText("Cancelar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => {
      expect(screen.queryByDisplayValue("carlos@mail.com")).toBeNull();
    });
  });

  it("llama a updateContactInfoService al guardar contacto", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar contacto")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar contacto"));
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

  it("muestra alerta de éxito tras guardar contacto", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar contacto")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar contacto"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Contacto actualizado")).toBeInTheDocument();
    });
  });

  it("muestra error cuando updateContactInfoService falla", async () => {
    updateContactInfoService.mockRejectedValue(
      Object.assign(new Error("Email inválido"), { status: 400 }),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar contacto")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar contacto"));
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
    await waitFor(() =>
      expect(
        screen.getByLabelText("Editar información administrativa"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información administrativa"));
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });
  });

  it("carga los catálogos de roles y casas al abrir edición admin", async () => {
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByLabelText("Editar información administrativa"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información administrativa"));
    await waitFor(() => {
      expect(getUpdateFormService).toHaveBeenCalledTimes(1);
    });
  });

  it("muestra las opciones de roles después de cargar catálogos", async () => {
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByLabelText("Editar información administrativa"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información administrativa"));
    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Coordinador")).toBeInTheDocument();
    });
  });

  it("cancela la edición administrativa", async () => {
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByLabelText("Editar información administrativa"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información administrativa"));
    await waitFor(() => expect(screen.getByText("Cancelar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => {
      expect(screen.queryByText("Guardar")).toBeNull();
    });
  });

  it("llama a updateAdminInfoService al guardar admin", async () => {
    renderPage();
    
    // 1. Abrir el formulario
    const editBtn = await screen.findByLabelText("Editar información administrativa");
    fireEvent.click(editBtn);

    // 2. Esperar a que los catálogos carguen y el botón "Guardar" esté habilitado
    const saveBtn = await screen.findByRole("button", { name: /guardar/i });
    
    // Verificamos que no esté deshabilitado (por el estado de carga del catálogo)
    await waitFor(() => expect(saveBtn).not.toBeDisabled());

    // 3. Click y esperar la llamada
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateAdminInfoService).toHaveBeenCalledWith(
        TEST_EMPLOYEE_ID,
        expect.any(Object)
      );
    });
  });

  it("muestra alerta de éxito tras guardar admin", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText("Editar información administrativa"));
    
    const saveBtn = await screen.findByRole("button", { name: /guardar/i });
    await waitFor(() => expect(saveBtn).not.toBeDisabled());
    
    fireEvent.click(saveBtn);

    // Buscamos el texto de éxito
    expect(await screen.findByText(/información administrativa actualizada/i)).toBeInTheDocument();
  });


  it("muestra error cuando updateAdminInfoService falla", async () => {
    updateAdminInfoService.mockRejectedValue(
      Object.assign(new Error("Salario inválido"), { status: 400 }),
    );
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByLabelText("Editar información administrativa"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información administrativa"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Salario inválido")).toBeInTheDocument();
    });
  });

  it("deshabilita Guardar mientras carga catálogos", async () => {
    getUpdateFormService.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        roles: [], houses: [], workdays: [],
      }), 500)),
    );
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByLabelText("Editar información administrativa"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información administrativa"));
    // El botón debería estar deshabilitado mientras carga
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
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByDisplayValue("Carlos")).toBeInTheDocument());
    // El email no debe estar en un input (contacto sigue en modo lectura)
    expect(screen.queryByDisplayValue("carlos@mail.com")).toBeNull();
  });

  it("al abrir contacto, no muestra formulario básico", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar contacto")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar contacto"));
    await waitFor(() =>
      expect(screen.getByDisplayValue("carlos@mail.com")).toBeInTheDocument(),
    );
    // El nombre no debe estar en un input (básica sigue en modo lectura)
    expect(screen.queryByDisplayValue("Carlos")).toBeNull();
  });

  it("solo hay un par Guardar/Cancelar activo a la vez", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Editar información básica"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());
    // Solo un Guardar visible
    expect(screen.getAllByText("Guardar")).toHaveLength(1);
    expect(screen.getAllByText("Cancelar")).toHaveLength(1);
  });
});