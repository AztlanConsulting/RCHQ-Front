// tests/integration/AltaEmpleado.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AltaPersonal from "../../Pages/Personal/AltaPersonal";

const mockNavigate = vi.fn();
const mockOnSuccess = vi.fn();

// Mock Router
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Services
vi.mock("../../Services/PersonalService", () => ({
  getEmployeeFormData: vi.fn(),
  createEmployee: vi.fn(),
}));

import {
  getEmployeeFormData,
  createEmployee,
} from "../../Services/PersonalService";

const renderPage = () =>
  render(
    <MemoryRouter>
      <AltaPersonal onSuccess={mockOnSuccess} />
    </MemoryRouter>,
  );

// Datos válidos reales (compatibles con Zod)
const validFormData = {
  name: "Juan",
  surname: "Pérez",
  email: "juan.perez@test.com",
  curp: "AAAA010101HDFNNN01",
  rfc: "AAAA010101A01",
  nss: "12345678901",
  bank_account: "123456789012345678",
  birthdate: "1990-01-01",
  role_id: "a0000002-0000-4000-8000-000000000002",
};

// Mock roles
const mockRoles = [
  {
    id: validFormData.role_id,
    role_id: validFormData.role_id,
    value: validFormData.role_id,
    name: "Administrador",
    label: "Administrador",
  },
];

const fillAndSubmit = async (data) => {
  for (const [key, value] of Object.entries(data)) {
    if (key === "role_id") {
      const nativeSelect = document.querySelector("select");
      if (nativeSelect) {
        fireEvent.change(nativeSelect, {
          target: { name: "role_id", value: value },
        });
      } else {
        const selectTriggers = screen.queryAllByText(/Selecciona un puesto/i);
        if (selectTriggers.length > 0) {
          const trigger = selectTriggers[selectTriggers.length - 1];
          fireEvent.click(trigger);

          const role = mockRoles.find(
            (r) => r.id === value || r.role_id === value,
          );
          const roleName = role ? role.name || role.label : "Administrador";

          const option = await screen.findByText(roleName);
          fireEvent.click(option);
        }
      }
    } else {
      const input =
        document.getElementById(key) ||
        document.querySelector(`input[name="${key}"]`);

      if (input) {
        fireEvent.change(input, {
          target: { name: key, value: value },
        });
      }
    }
  }

  const submitBtn = screen.getByRole("button", {
    name: /guardar|crear|registrar|alta/i,
  });

  await act(async () => {
    fireEvent.click(submitBtn);
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AltaPersonal — integración de formulario y servicios", () => {
  it("carga los roles iniciales y quita el estado de carga", async () => {
    // Arrange
    getEmployeeFormData.mockResolvedValue({ roles: mockRoles });

    // Act
    renderPage();

    // Assert
    expect(screen.getByText(/cargando datos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/cargando datos/i)).not.toBeInTheDocument();
    });
    expect(getEmployeeFormData).toHaveBeenCalledTimes(1);
  });

  it("muestra un error de Zod si el formulario está vacío", async () => {
    // Arrange
    getEmployeeFormData.mockResolvedValue({ roles: mockRoles });
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/cargando datos/i)).not.toBeInTheDocument(),
    );

    // Act
    const submitBtn = screen.getByRole("button", {
      name: /guardar|crear|registrar|alta/i,
    });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Assert
    await waitFor(() => {
      expect(createEmployee).not.toHaveBeenCalled();
      expect(screen.getByText(/El nombre es obligatorio/i)).toBeInTheDocument();
    });
  });

  it("crea el empleado exitosamente", async () => {
    // Arrange
    getEmployeeFormData.mockResolvedValue({ roles: mockRoles });
    createEmployee.mockResolvedValue({ success: true });
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/cargando datos/i)).not.toBeInTheDocument(),
    );

    // Act
    await fillAndSubmit(validFormData);

    // Assert
    await waitFor(() => {
      expect(createEmployee).toHaveBeenCalledTimes(1);
    });
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it("muestra error si el backend falla", async () => {
    // Arrange
    getEmployeeFormData.mockResolvedValue({ roles: mockRoles });
    createEmployee.mockRejectedValue(
      new Error("El correo electrónico ya está registrado"),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/cargando datos/i)).not.toBeInTheDocument(),
    );

    // Act
    await fillAndSubmit(validFormData);

    // Assert
    await waitFor(() => {
      expect(createEmployee).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByText("El correo electrónico ya está registrado"),
    ).toBeInTheDocument();
  });
});
