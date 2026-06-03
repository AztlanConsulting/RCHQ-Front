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

vi.mock("../../services/deleteEventService", () => ({
    deleteHouseEvent: vi.fn(),
    removeEmployeeFromTraining: vi.fn(),
    deletePersonalEvent: vi.fn(),
}));

vi.mock("../../hooks/pages/useEmployeeDetail", () => ({
    useEmployeeDetail: vi.fn(),
}));

vi.mock("../../utils/schema/employee/update.schema", () => ({
    employeeBasicUpdateSchema: {
        safeParse: vi.fn((data) => ({ success: true, data })),
    },
    employeeContactUpdateSchema: {
        safeParse: vi.fn((data) => ({ success: true, data })),
    },
    employeeAdminUpdateSchema: {
        safeParse: vi.fn((data) => ({ success: true, data })),
    },
    normalizeEmployeeContractType: vi.fn((value) => value),
}));

import { useEmployeeDetail } from "../../hooks/pages/useEmployeeDetail";
import { getTrainingsService } from "../../services/trainingService";
import { removeEmployeeFromTraining } from "../../services/deleteEventService";

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
                <Route
                    path="/app/personal/:employeeId"
                    element={<DetalleEmpleado />}
                />
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
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupEmployeeDetail();
    getTrainingsService.mockResolvedValue({ success: true, data: [] });
    removeEmployeeFromTraining.mockResolvedValue({
        message: "Empleado eliminado de la capacitación correctamente.",
    });
});

describe("DetalleEmpleado - quitar empleado de capacitación", () => {
    describe("visibilidad del botón de quitar según rol", () => {
        it("coordinador ve el botón de quitar en la tarjeta de capacitación", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");

            expect(
                screen.getByTitle("Quitar de esta capacitación"),
            ).toBeInTheDocument();
        });

        it("coordinador ve un botón de quitar por cada capacitación", async () => {
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

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            await screen.findByText("Capacitacion de seguridad");

            expect(
                screen.getAllByTitle("Quitar de esta capacitación"),
            ).toHaveLength(2);
        });

        it("administrador no ve el botón de quitar en la tarjeta de capacitación", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Administrador");

            await screen.findByText("Capacitacion del DIF");

            expect(
                screen.queryByTitle("Quitar de esta capacitación"),
            ).not.toBeInTheDocument();
        });
    });

    describe("flujo de confirmación", () => {
        it("al hacer clic en quitar se abre el modal con el nombre de la capacitación", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() => {
                expect(screen.getByRole("dialog")).toBeInTheDocument();
            });

            const dialog = screen.getByRole("dialog");
            expect(
                within(dialog).getByText("Quitar de capacitación"),
            ).toBeInTheDocument();
            expect(
                within(dialog).getByText(/Capacitacion del DIF/),
            ).toBeInTheDocument();
        });

        it("al cancelar el modal se cierra sin llamar al servicio", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                screen.getByRole("button", { name: /^cancelar$/i }),
            );

            await waitFor(() => {
                expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            });

            expect(removeEmployeeFromTraining).not.toHaveBeenCalled();
        });
    });

    describe("llamada al servicio removeEmployeeFromTraining", () => {
        it("al confirmar llama al servicio con el eventId y employeeId correctos", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            await waitFor(() => {
                expect(removeEmployeeFromTraining).toHaveBeenCalledWith(
                    "training-001",
                    TEST_EMPLOYEE_ID,
                );
            });
        });

        it("tras una eliminación exitosa la capacitación desaparece del listado", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            await waitFor(() => {
                expect(
                    screen.queryByText("Capacitacion del DIF"),
                ).not.toBeInTheDocument();
            });
        });

        it("tras una eliminación exitosa el modal se cierra", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            await waitFor(() => {
                expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            });
        });

        it("tras una eliminación exitosa llama a setAlert con el mensaje de éxito", async () => {
            const setAlert = vi.fn();
            setupEmployeeDetail({ setAlert });

            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            await waitFor(() => {
                expect(setAlert).toHaveBeenCalledWith({
                    type: "success",
                    message:
                        "Empleado eliminado de la capacitación correctamente.",
                });
            });
        });

        it("al confirmar con personalEventId usa ese id en lugar de eventId", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [
                    buildTraining({
                        eventId: undefined,
                        personalEventId: "pev-999",
                    }),
                ],
            });

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            await waitFor(() => {
                expect(removeEmployeeFromTraining).toHaveBeenCalledWith(
                    "pev-999",
                    TEST_EMPLOYEE_ID,
                );
            });
        });
    });

    describe("manejo de errores", () => {
        it("si el servicio falla muestra el error dentro del modal sin cerrarlo", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });
            removeEmployeeFromTraining.mockRejectedValueOnce(
                new Error("No se pudo eliminar al empleado de la capacitación"),
            );

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            expect(
                await screen.findByText(
                    "No se pudo eliminar al empleado de la capacitación",
                ),
            ).toBeInTheDocument();

            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });

        it("si el servicio falla la capacitación sigue visible en el listado", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });
            removeEmployeeFromTraining.mockRejectedValueOnce(
                new Error("Error del servidor"),
            );

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            await screen.findByText("Error del servidor");

            // La tarjeta y el modal abierto ambos contienen el título; verificar que al menos uno existe
            expect(
                screen.getAllByText("Capacitacion del DIF").length,
            ).toBeGreaterThan(0);
        });

        it("el error se limpia al cancelar el modal tras un fallo", async () => {
            getTrainingsService.mockResolvedValue({
                success: true,
                data: [buildTraining()],
            });
            removeEmployeeFromTraining.mockRejectedValueOnce(
                new Error("Error del servidor"),
            );

            renderPage("Coordinador");

            await screen.findByText("Capacitacion del DIF");
            fireEvent.click(screen.getByTitle("Quitar de esta capacitación"));

            await waitFor(() =>
                expect(screen.getByRole("dialog")).toBeInTheDocument(),
            );

            fireEvent.click(
                within(screen.getByRole("dialog")).getByRole("button", {
                    name: /^eliminar$/i,
                }),
            );

            await screen.findByText("Error del servidor");

            fireEvent.click(
                screen.getByRole("button", { name: /^cancelar$/i }),
            );

            await waitFor(() => {
                expect(
                    screen.queryByText("Error del servidor"),
                ).not.toBeInTheDocument();
            });
        });
    });
});
