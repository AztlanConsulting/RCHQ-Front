// src/tests/unit/employeeUpdate.unit.test.jsx

import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// ── Mocks globales ─────────────────────────────────────────────────────────────

vi.mock("../utils/authStorage", () => ({
  getToken: vi.fn(() => "mock-token"),
}));

vi.mock("@/utils/secureFetchWrapper", () => ({
  secureFetch: vi.fn(),
}));

vi.mock("../utils/apiErrors", () => ({
  buildApiError: vi.fn((res, data, msg) => new Error(data?.message ?? msg)),
}));

// ── Imports después de los mocks ───────────────────────────────────────────────

import { getToken } from "../utils/authStorage";
import { secureFetch } from "@/utils/secureFetchWrapper";
import {
  getUpdateFormService,
  updateBasicInfoService,
  updateContactInfoService,
  updateAdminInfoService,
} from "../services/employeeUpdateService";

import EmployeeContactCard from "../components/organism/employeeContactCard";
import EmployeeBasicCard   from "../components/organism/employeeBasicCard";
import EmployeeAdminCard   from "../components/organism/employeeAdminCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockFetch = (ok, data, status = 200) => {
  secureFetch.mockResolvedValue({
    ok,
    status,
    json: async () => data,
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// SERVICE: employeeUpdateService
// ══════════════════════════════════════════════════════════════════════════════

describe("employeeUpdateService", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    getToken.mockReturnValue("mock-token");
  });

  // ── getUpdateFormService ───────────────────────────────────────────────────

  describe("getUpdateFormService", () => {
    it("lanza error si no hay token", async () => {
      getToken.mockReturnValue(null);
      await expect(getUpdateFormService()).rejects.toThrow("No se encontró token de sesión");
      expect(secureFetch).not.toHaveBeenCalled();
    });

    it("llama al endpoint correcto con el token", async () => {
      mockFetch(true, { roles: [], houses: [], workdays: [] });
      await getUpdateFormService();
      expect(secureFetch).toHaveBeenCalledWith(
        expect.stringContaining("/employee/update-form"),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: "Bearer mock-token" }),
        }),
      );
    });

    it("retorna los datos cuando la respuesta es ok", async () => {
      const mockData = { roles: [{ roleId: "r1" }], houses: [], workdays: [] };
      mockFetch(true, mockData);
      const result = await getUpdateFormService();
      expect(result).toEqual(mockData);
    });

    it("lanza error cuando la respuesta no es ok", async () => {
      mockFetch(false, { message: "Forbidden" }, 403);
      await expect(getUpdateFormService()).rejects.toThrow();
    });
  });

  // ── updateBasicInfoService ─────────────────────────────────────────────────

  describe("updateBasicInfoService", () => {
    const EMP_ID = "emp-001";
    const body   = { name: "Juan", surname: "Pérez" };

    it("lanza error si no hay token", async () => {
      getToken.mockReturnValue(null);
      await expect(updateBasicInfoService(EMP_ID, body)).rejects.toThrow("No se encontró token de sesión");
    });

    it("llama al endpoint PUT correcto", async () => {
      mockFetch(true, { success: true });
      await updateBasicInfoService(EMP_ID, body);
      expect(secureFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/employee/${EMP_ID}/basic-info`),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        }),
      );
    });

    it("serializa el body como JSON", async () => {
      mockFetch(true, { success: true });
      await updateBasicInfoService(EMP_ID, body);
      const call = secureFetch.mock.calls[0][1];
      expect(JSON.parse(call.body)).toEqual(body);
    });

    it("retorna los datos si la respuesta es ok", async () => {
      const mockData = { success: true, message: "Actualizado" };
      mockFetch(true, mockData);
      const result = await updateBasicInfoService(EMP_ID, body);
      expect(result).toEqual(mockData);
    });

    it("lanza error si la respuesta no es ok (400)", async () => {
      mockFetch(false, { message: "Datos inválidos" }, 400);
      await expect(updateBasicInfoService(EMP_ID, body)).rejects.toThrow();
    });

    it("lanza error si la respuesta no es ok (404)", async () => {
      mockFetch(false, { message: "No encontrado" }, 404);
      await expect(updateBasicInfoService(EMP_ID, {})).rejects.toThrow();
    });

    it("lanza error si la respuesta no es ok (500)", async () => {
      mockFetch(false, { message: "Server error" }, 500);
      await expect(updateBasicInfoService(EMP_ID, body)).rejects.toThrow();
    });
  });

  // ── updateContactInfoService ───────────────────────────────────────────────

  describe("updateContactInfoService", () => {
    const EMP_ID = "emp-001";
    const body   = { email: "juan@mail.com", phoneNumber: "4421234567" };

    it("lanza error si no hay token", async () => {
      getToken.mockReturnValue(null);
      await expect(updateContactInfoService(EMP_ID, body)).rejects.toThrow("No se encontró token de sesión");
    });

    it("llama al endpoint PUT de contact-info", async () => {
      mockFetch(true, { success: true });
      await updateContactInfoService(EMP_ID, body);
      expect(secureFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/employee/${EMP_ID}/contact-info`),
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("retorna datos si ok", async () => {
      const mockData = { success: true };
      mockFetch(true, mockData);
      const result = await updateContactInfoService(EMP_ID, body);
      expect(result).toEqual(mockData);
    });

    it("lanza error si no ok", async () => {
      mockFetch(false, { message: "Error contacto" }, 400);
      await expect(updateContactInfoService(EMP_ID, body)).rejects.toThrow();
    });
  });

  // ── updateAdminInfoService ─────────────────────────────────────────────────

  describe("updateAdminInfoService", () => {
    const EMP_ID = "emp-001";
    const body   = { type: "tiempo_completo", salary: 15000 };

    it("lanza error si no hay token", async () => {
      getToken.mockReturnValue(null);
      await expect(updateAdminInfoService(EMP_ID, body)).rejects.toThrow("No se encontró token de sesión");
    });

    it("llama al endpoint PUT de admin-info", async () => {
      mockFetch(true, { success: true });
      await updateAdminInfoService(EMP_ID, body);
      expect(secureFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/employee/${EMP_ID}/admin-info`),
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("serializa el body como JSON", async () => {
      mockFetch(true, { success: true });
      await updateAdminInfoService(EMP_ID, body);
      const call = secureFetch.mock.calls[0][1];
      expect(JSON.parse(call.body)).toEqual(body);
    });

    it("retorna datos si ok", async () => {
      const mockData = { success: true };
      mockFetch(true, mockData);
      const result = await updateAdminInfoService(EMP_ID, body);
      expect(result).toEqual(mockData);
    });

    it("lanza error si no ok", async () => {
      mockFetch(false, { message: "Error admin" }, 400);
      await expect(updateAdminInfoService(EMP_ID, body)).rejects.toThrow();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EmployeeContactCard
// ══════════════════════════════════════════════════════════════════════════════

describe("EmployeeContactCard", () => {

  const mockEmployee = {
    email:       "juan@mail.com",
    phoneNumber: "4421234567",
  };

  const mockAddress = {
    street:     "Calle Falsa 123",
    postalCode: "76000",
  };

  const mockContactForm = {
    email:       "juan@mail.com",
    phoneNumber: "4421234567",
    street:      "Calle Falsa 123",
    municipio:   "Centro",
    city:        "Querétaro",
    postalCode:  "76000",
  };

  const defaultProps = {
    employee:        mockEmployee,
    employeeAddress: mockAddress,
    isEditing:       false,
    contactForm:     mockContactForm,
    setContactField: vi.fn(),
    saving:          false,
    saveError:       null,
    onOpenEdit:      vi.fn(),
    onSubmit:        vi.fn(),
    onCancel:        vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  // ── Modo lectura ───────────────────────────────────────────────────────────

  describe("Modo lectura (isEditing=false)", () => {
    it("muestra el título 'Contacto'", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.getByText("Contacto")).toBeInTheDocument();
    });

    it("muestra el botón de editar (lápiz)", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.getByLabelText("Editar contacto")).toBeInTheDocument();
    });

    it("muestra el email del empleado", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.getByText("juan@mail.com")).toBeInTheDocument();
    });

    it("muestra el teléfono del empleado", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.getByText("4421234567")).toBeInTheDocument();
    });

    it("muestra la dirección del empleado", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.getByText("Calle Falsa 123")).toBeInTheDocument();
    });

    it("muestra el código postal", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.getByText("76000")).toBeInTheDocument();
    });

    it("muestra 'N/A' si el email es null", () => {
      render(<EmployeeContactCard {...defaultProps} employee={{ ...mockEmployee, email: null }} />);
      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
    });

    it("muestra 'N/A' si phoneNumber es undefined", () => {
      render(<EmployeeContactCard {...defaultProps} employee={{ ...mockEmployee, phoneNumber: undefined }} />);
      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
    });

    it("muestra 'N/A' si la dirección es null", () => {
      render(<EmployeeContactCard {...defaultProps} employeeAddress={null} />);
      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
    });

    it("llama a onOpenEdit al hacer click en el botón lápiz", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Editar contacto"));
      expect(defaultProps.onOpenEdit).toHaveBeenCalledTimes(1);
    });

    it("no muestra inputs de edición en modo lectura", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.queryByRole("textbox", { name: /Correo/i })).toBeNull();
    });

    it("no muestra botones Guardar/Cancelar en modo lectura", () => {
      render(<EmployeeContactCard {...defaultProps} />);
      expect(screen.queryByText("Guardar")).toBeNull();
      expect(screen.queryByText("Cancelar")).toBeNull();
    });
  });

  // ── Modo edición ───────────────────────────────────────────────────────────

  describe("Modo edición (isEditing=true)", () => {
    const editingProps = { ...defaultProps, isEditing: true };

    it("muestra los botones Guardar y Cancelar", () => {
      render(<EmployeeContactCard {...editingProps} />);
      expect(screen.getByText("Guardar")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    it("no muestra el botón lápiz en modo edición", () => {
      render(<EmployeeContactCard {...editingProps} />);
      expect(screen.queryByLabelText("Editar contacto")).toBeNull();
    });

    it("muestra los inputs de edición", () => {
      render(<EmployeeContactCard {...editingProps} />);
      expect(screen.getByDisplayValue("juan@mail.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("4421234567")).toBeInTheDocument();
    });

    it("llama a onCancel al hacer click en Cancelar", () => {
      render(<EmployeeContactCard {...editingProps} />);
      fireEvent.click(screen.getByText("Cancelar"));
      expect(editingProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it("llama a onSubmit al hacer click en Guardar", () => {
      render(<EmployeeContactCard {...editingProps} />);
      fireEvent.click(screen.getByText("Guardar"));
      expect(editingProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    it("llama a setContactField al cambiar el email", () => {
      render(<EmployeeContactCard {...editingProps} />);
      const input = screen.getByDisplayValue("juan@mail.com");
      fireEvent.change(input, { target: { value: "nuevo@mail.com" } });
      expect(editingProps.setContactField).toHaveBeenCalledWith("email", "nuevo@mail.com");
    });

    it("llama a setContactField al cambiar el teléfono", () => {
      render(<EmployeeContactCard {...editingProps} />);
      const input = screen.getByDisplayValue("4421234567");
      fireEvent.change(input, { target: { value: "9991234567" } });
      expect(editingProps.setContactField).toHaveBeenCalledWith("phoneNumber", "9991234567");
    });

    it("deshabilita ambos botones cuando saving=true", () => {
      render(<EmployeeContactCard {...editingProps} saving={true} />);
      expect(screen.getByText("Guardar").closest("button")).toBeDisabled();
      expect(screen.getByText("Cancelar").closest("button")).toBeDisabled();
    });

    it("muestra el error de guardado cuando saveError tiene valor", () => {
      render(<EmployeeContactCard {...editingProps} saveError="Correo inválido" />);
      expect(screen.getByText("Correo inválido")).toBeInTheDocument();
    });

    it("no muestra el error de guardado si saveError es null", () => {
      render(<EmployeeContactCard {...editingProps} saveError={null} />);
      expect(screen.queryByText(/inválido/i)).toBeNull();
    });

    it("no muestra los valores de lectura en modo edición", () => {
      render(<EmployeeContactCard {...editingProps} />);
      // Los labels de lectura sí están, pero los valores en divs inset no
      expect(screen.queryByText("N/A")).toBeNull();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EmployeeBasicCard
// ══════════════════════════════════════════════════════════════════════════════

describe("EmployeeBasicCard", () => {

  const mockEmployee = {
    name:      "Carlos",
    surname:   "Ramírez",
    role:      "Admin",
    birthDate: "2003-10-04T00:00:00.000Z",
    startDate: "2026-04-09T00:00:00.000Z",
    endDate:   null,
    curp:      "XAXX010101HDFXXX01",
    nss:       null,
    rfc:       null,
    bankAccount: null,
    isActive:  true,
    picture:   null,
  };

  const mockBasicForm = {
    name: "Carlos", surname: "Ramírez", curp: "XAXX010101HDFXXX01",
    rfc: "", nss: "", bankAccount: "", birthDate: "2003-10-04",
  };

  const mockInfoDrawer = { isOpen: false, toggle: vi.fn() };

  const defaultProps = {
    employee:      mockEmployee,
    employeeHouse: { name: "Desarrollo" },
    isEditing:     false,
    basicForm:     mockBasicForm,
    setBasicField: vi.fn(),
    saving:        false,
    saveError:     null,
    infoDrawer:    mockInfoDrawer,
    onOpenEdit:    vi.fn(),
    onSubmit:      vi.fn(),
    onCancel:      vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  // ── Modo lectura ───────────────────────────────────────────────────────────

  describe("Modo lectura", () => {
    it("muestra el nombre completo del empleado", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      expect(screen.getByText("Carlos Ramírez")).toBeInTheDocument();
    });

    it("muestra la casa del empleado", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      expect(screen.getByText("Casa - Desarrollo")).toBeInTheDocument();
    });

    it("muestra el puesto", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("muestra el chip de estado activo", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      expect(screen.getByRole("status", { name: "Empleado activo" })).toBeInTheDocument();
    });

    it("muestra el chip de estado inactivo", () => {
      render(<EmployeeBasicCard {...defaultProps} employee={{ ...mockEmployee, isActive: false }} />);
      expect(screen.getByRole("status", { name: "Empleado inactivo" })).toBeInTheDocument();
    });

    it("muestra el botón lápiz", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      expect(screen.getByLabelText("Editar información básica")).toBeInTheDocument();
    });

    it("llama a onOpenEdit al hacer click en el lápiz", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Editar información básica"));
      expect(defaultProps.onOpenEdit).toHaveBeenCalledTimes(1);
    });

    it("no muestra inputs en modo lectura", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      expect(screen.queryByDisplayValue("Carlos")).toBeNull();
    });

    it("muestra el drawer toggle cuando no está editando", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      expect(screen.getByLabelText("Ver más información")).toBeInTheDocument();
    });

    it("llama a infoDrawer.toggle al hacer click en el toggle", () => {
      render(<EmployeeBasicCard {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Ver más información"));
      expect(mockInfoDrawer.toggle).toHaveBeenCalledTimes(1);
    });
  });

  // ── Modo edición ───────────────────────────────────────────────────────────

  describe("Modo edición", () => {
    const editingProps = { ...defaultProps, isEditing: true };

    it("muestra los botones Guardar y Cancelar", () => {
      render(<EmployeeBasicCard {...editingProps} />);
      expect(screen.getByText("Guardar")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    it("muestra los inputs precargados con los valores del form", () => {
      render(<EmployeeBasicCard {...editingProps} />);
      expect(screen.getByDisplayValue("Carlos")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Ramírez")).toBeInTheDocument();
    });

    it("llama a setBasicField al cambiar el nombre", () => {
      render(<EmployeeBasicCard {...editingProps} />);
      const nameInput = screen.getByDisplayValue("Carlos");
      fireEvent.change(nameInput, { target: { value: "Nuevo Nombre" } });
      expect(editingProps.setBasicField).toHaveBeenCalledWith("name", "Nuevo Nombre");
    });

    it("llama a onCancel al hacer click en Cancelar", () => {
      render(<EmployeeBasicCard {...editingProps} />);
      fireEvent.click(screen.getByText("Cancelar"));
      expect(editingProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it("llama a onSubmit al hacer click en Guardar", () => {
      render(<EmployeeBasicCard {...editingProps} />);
      fireEvent.click(screen.getByText("Guardar"));
      expect(editingProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    it("deshabilita botones cuando saving=true", () => {
      render(<EmployeeBasicCard {...editingProps} saving={true} />);
      expect(screen.getByText("Guardar").closest("button")).toBeDisabled();
      expect(screen.getByText("Cancelar").closest("button")).toBeDisabled();
    });

    it("muestra el saveError cuando está definido", () => {
      render(<EmployeeBasicCard {...editingProps} saveError="CURP inválido" />);
      expect(screen.getByText("CURP inválido")).toBeInTheDocument();
    });

    it("no muestra el drawer toggle en modo edición", () => {
      render(<EmployeeBasicCard {...editingProps} />);
      expect(screen.queryByLabelText("Ver más información")).toBeNull();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EmployeeAdminCard
// ══════════════════════════════════════════════════════════════════════════════

describe("EmployeeAdminCard", () => {

  const mockEmployee = { type: "tiempo_completo", salary: "15000", houseId: "h1", roleId: "r1" };

  const mockWorkdays = [
    { workdayId: "wd1", name: "Lunes",   start: "1970-01-01T08:00:00.000Z", end: "1970-01-01T17:00:00.000Z" },
    { workdayId: "wd2", name: "Martes",  start: "1970-01-01T08:00:00.000Z", end: "1970-01-01T17:00:00.000Z" },
  ];

  const mockAdminForm = {
    houseId: "h1",
    roleId:  "r1",
    type:    "tiempo_completo",
    salary:  "15000",
    selectedWorkdays: [
      { workdayId: "wd1", name: "Lunes",   selected: true,  start: "08:00", end: "17:00" },
      { workdayId: "wd2", name: "Martes",  selected: false, start: "08:00", end: "17:00" },
    ],
  };

  const mockWorkdaysDrawer = { isOpen: false, toggle: vi.fn() };

  const defaultProps = {
    employee:                mockEmployee,
    employeeWorkdays:        mockWorkdays,
    employeeVacationRequests: [],
    employeeFaults:          [],
    workdaysDrawer:          mockWorkdaysDrawer,
    isEditing:               false,
    loadingCatalogues:       false,
    adminForm:               mockAdminForm,
    roles:   [{ roleId: "r1", name: "Admin" }, { roleId: "r2", name: "Coordinador" }],
    houses:  [{ houseId: "h1", name: "Casa Test" }],
    setAdminField:  vi.fn(),
    toggleWorkday:  vi.fn(),
    setWorkdayTime: vi.fn(),
    saving:         false,
    saveError:      null,
    onOpenEdit:     vi.fn(),
    onSubmit:       vi.fn(),
    onCancel:       vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  // ── Modo lectura ───────────────────────────────────────────────────────────

  describe("Modo lectura", () => {
    it("muestra el título", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.getByText("Información Administrativa")).toBeInTheDocument();
    });

    it("muestra el tipo de contrato", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.getByText("tiempo_completo")).toBeInTheDocument();
    });

    it("muestra el salario con signo de pesos", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.getByText("$15000")).toBeInTheDocument();
    });

    it("muestra N/A cuando el salario es null", () => {
      render(<EmployeeAdminCard {...defaultProps} employee={{ ...mockEmployee, salary: null }} />);
      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
    });

    it("muestra el número de días trabajados", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.getByText("2")).toBeInTheDocument(); // 2 workdays
    });

    it("muestra 0 faltas", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("muestra 0 solicitudes de vacaciones", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.getByText("0 Solicitudes")).toBeInTheDocument();
    });

    it("muestra el botón lápiz", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.getByLabelText("Editar información administrativa")).toBeInTheDocument();
    });

    it("llama a onOpenEdit al hacer click en el lápiz", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Editar información administrativa"));
      expect(defaultProps.onOpenEdit).toHaveBeenCalledTimes(1);
    });

    it("no muestra botones Guardar/Cancelar en lectura", () => {
      render(<EmployeeAdminCard {...defaultProps} />);
      expect(screen.queryByText("Guardar")).toBeNull();
      expect(screen.queryByText("Cancelar")).toBeNull();
    });
  });

  // ── Modo edición ───────────────────────────────────────────────────────────

  describe("Modo edición", () => {
    const editingProps = { ...defaultProps, isEditing: true };

    it("muestra los botones Guardar y Cancelar", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      expect(screen.getByText("Guardar")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    it("muestra el select de Casa con la opción correcta", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      expect(screen.getByText("Casa Test")).toBeInTheDocument();
    });

    it("muestra el select de Puesto", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("muestra los checkboxes de días de trabajo", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      expect(screen.getByText("Lunes")).toBeInTheDocument();
      expect(screen.getByText("Martes")).toBeInTheDocument();
    });

    it("el checkbox de Lunes está marcado (selected=true)", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked(); // Lunes
    });

    it("el checkbox de Martes NO está marcado (selected=false)", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[1]).not.toBeChecked(); // Martes
    });

    it("llama a toggleWorkday al hacer click en un checkbox", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]); // Martes
      expect(editingProps.toggleWorkday).toHaveBeenCalledWith("wd2");
    });

    it("muestra inputs de hora cuando el día está seleccionado", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      const timeInputs = screen.getAllByDisplayValue("08:00");
      expect(timeInputs.length).toBeGreaterThan(0);
    });

    it("llama a setWorkdayTime al cambiar la hora de inicio", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      const timeInputs = screen.getAllByDisplayValue("08:00");
      fireEvent.change(timeInputs[0], { target: { value: "09:00" } });
      expect(editingProps.setWorkdayTime).toHaveBeenCalledWith("wd1", "start", "09:00");
    });

    it("llama a onCancel al hacer click en Cancelar", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      fireEvent.click(screen.getByText("Cancelar"));
      expect(editingProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it("llama a onSubmit al hacer click en Guardar", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      fireEvent.click(screen.getByText("Guardar"));
      expect(editingProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    it("deshabilita Guardar cuando saving=true", () => {
      render(<EmployeeAdminCard {...editingProps} saving={true} />);
      expect(screen.getByText("Guardar").closest("button")).toBeDisabled();
    });

    it("deshabilita Guardar cuando loadingCatalogues=true", () => {
      render(<EmployeeAdminCard {...editingProps} loadingCatalogues={true} />);
      expect(screen.getByText("Guardar").closest("button")).toBeDisabled();
    });

    it("muestra Loader cuando loadingCatalogues=true", () => {
      render(<EmployeeAdminCard {...editingProps} loadingCatalogues={true} />);
      expect(screen.getByRole("status", { name: "Cargando" })).toBeInTheDocument();
    });

    it("muestra el saveError cuando está definido", () => {
      render(<EmployeeAdminCard {...editingProps} saveError="Error de admin" />);
      expect(screen.getByText("Error de admin")).toBeInTheDocument();
    });

    it("llama a setAdminField al cambiar el salario", () => {
      render(<EmployeeAdminCard {...editingProps} />);
      const salaryInput = screen.getByPlaceholderText("Ej: 15000");
      fireEvent.change(salaryInput, { target: { value: "20000" } });
      expect(editingProps.setAdminField).toHaveBeenCalledWith("salary", "20000");
    });
  });
});