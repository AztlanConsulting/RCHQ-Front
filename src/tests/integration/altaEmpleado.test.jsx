import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AltaPersonal from "../../pages/personal/altaPersonal";

const mockNavigate = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/personalService", () => ({
    getEmployeeFormData: vi.fn(),
    createEmployee: vi.fn(),
}));

vi.mock("../../components/atoms/dateField", () => ({
    default: ({ label, name, value, onChange, placeholder }) => (
        <label>
            {label}
            <input
                aria-label={typeof label === "string" ? label : name}
                id={name}
                name={name}
                type="date"
                value={value ?? ""}
                placeholder={placeholder}
                onChange={onChange}
            />
        </label>
    ),
}));

import {
    getEmployeeFormData,
    createEmployee,
} from "../../services/personalService";

const renderPage = () =>
    render(
        <MemoryRouter>
            <AltaPersonal onSuccess={mockOnSuccess} />
        </MemoryRouter>,
    );

const validFormData = {
    name: "Juan",
    surname: "Pérez",
    email: "juan.perez@test.com",
    curp: "AAAA010101HDFNNN01",
    rfc: "AAAA010101A01",
    nss: "12345678901",
    bankAccount: "123456789012345678",
    birthDate: "1990-01-01",
    startDate: "2020-01-15",
    roleId: "a0000002-0000-4000-8000-000000000002",
};

const mockRoles = [
    {
        id: validFormData.roleId,
        roleId: validFormData.roleId,
        value: validFormData.roleId,
        name: "Administrador",
        label: "Administrador",
    },
];

const fillAndSubmit = async (data) => {
    for (const [key, value] of Object.entries(data)) {
        if (key === "roleId") {
            const nativeSelect = document.querySelector("select");
            if (nativeSelect) {
                fireEvent.change(nativeSelect, {
                    target: { name: "roleId", value: value },
                });
            } else {
                const selectTriggers =
                    screen.queryAllByText(/Selecciona un puesto/i);
                if (selectTriggers.length > 0) {
                    const trigger = selectTriggers[selectTriggers.length - 1];
                    fireEvent.click(trigger);

                    const role = mockRoles.find(
                        (r) => r.id === value || r.roleId === value,
                    );
                    const roleName = role
                        ? role.name || role.label
                        : "Administrador";

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
        
        getEmployeeFormData.mockResolvedValue({ roles: mockRoles });

        renderPage();

        expect(screen.getByText(/cargando datos/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.queryByText(/cargando datos/i),
            ).not.toBeInTheDocument();
        });
        expect(getEmployeeFormData).toHaveBeenCalledTimes(1);
    });

    it("muestra un error de Zod si el formulario está vacío", async () => {
        getEmployeeFormData.mockResolvedValue({ roles: mockRoles });
        renderPage();
        await waitFor(() =>
            expect(
                screen.queryByText(/cargando datos/i),
            ).not.toBeInTheDocument(),
        );

        const submitBtn = screen.getByRole("button", {
            name: /guardar|crear|registrar|alta/i,
        });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        await waitFor(() => {
            expect(createEmployee).not.toHaveBeenCalled();
            expect(
                screen.getAllByText(/El nombre es obligatorio/i).length,
            ).toBeGreaterThan(0);
            expect(
                screen.getAllByText(/El nombre es obligatorio/i)[0],
            ).toBeInTheDocument();
        });
    });

    it("crea el empleado exitosamente", async () => {
        getEmployeeFormData.mockResolvedValue({ roles: mockRoles });
        createEmployee.mockResolvedValue({ success: true });
        renderPage();
        await waitFor(() =>
            expect(
                screen.queryByText(/cargando datos/i),
            ).not.toBeInTheDocument(),
        );

        await fillAndSubmit(validFormData);

        await waitFor(() => {
            expect(createEmployee).toHaveBeenCalledTimes(1);
        });
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it("muestra error si el backend falla", async () => {
        getEmployeeFormData.mockResolvedValue({ roles: mockRoles });
        createEmployee.mockRejectedValue(
            new Error("El correo electrónico ya está registrado"),
        );
        renderPage();
        await waitFor(() =>
            expect(
                screen.queryByText(/cargando datos/i),
            ).not.toBeInTheDocument(),
        );

        await fillAndSubmit(validFormData);

        await waitFor(() => {
            expect(createEmployee).toHaveBeenCalledTimes(1);
        });
        expect(
            screen.getByText("El correo electrónico ya está registrado"),
        ).toBeInTheDocument();
    });
});
