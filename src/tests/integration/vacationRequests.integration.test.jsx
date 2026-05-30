import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
    within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VacationRequests from "../../pages/vacationRequests";
import {
    getPendingVacationRequests,
    getReviewedVacationRequests,
    approveVacationRequest,
    rejectVacationRequest,
} from "../../services/vacationRequestService";

vi.mock("../../services/vacationRequestService", () => ({
    getPendingVacationRequests: vi.fn(),
    getReviewedVacationRequests: vi.fn(),
    approveVacationRequest: vi.fn(),
    rejectVacationRequest: vi.fn(),
}));

vi.mock("../../components/atoms/vacationDateField", () => ({
    default: ({ label, name, value, onChange }) => (
        <label>
            {label}
            <input
                aria-label={label}
                name={name}
                value={value}
                onChange={onChange}
            />
        </label>
    ),
}));

const wait = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

const pendingRequests = [
    {
        vacationRequestId: "vac-001",
        startDate: "2026-05-15T00:00:00.000Z",
        endDate: "2026-05-20T00:00:00.000Z",
        usedDays: 4,
        status: 0,
        statusLabel: "Pendiente",
        employee: {
            fullName: "Ana Pendiente",
            curp: "US800101HDF00003",
            picture: null,
        },
    },
    {
        vacationRequestId: "vac-002",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: "2026-06-05T00:00:00.000Z",
        usedDays: 5,
        status: 0,
        statusLabel: "Pendiente",
        employee: {
            fullName: "Luis Vacaciones",
            curp: "LUVX010101HDF00001",
            picture: null,
        },
    },
];

const reviewedRequests = [
    {
        vacationRequestId: "vac-003",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2026-04-02T00:00:00.000Z",
        usedDays: 2,
        status: 1,
        statusLabel: "Aprobada",
        employee: {
            fullName: "Marta Revisada",
            curp: "MARV010101HDF00002",
            picture: null,
        },
    },
];

const pendingResponse = {
    data: pendingRequests,
    pagination: {
        page: 1,
        limit: 6,
        total: 2,
        totalPages: 1,
    },
};

const reviewedResponse = {
    data: reviewedRequests,
    pagination: {
        page: 1,
        limit: 6,
        total: 1,
        totalPages: 1,
    },
};

const singlePendingResponse = {
    data: [pendingRequests[0]],
    pagination: {
        page: 1,
        limit: 6,
        total: 1,
        totalPages: 1,
    },
};

const renderComponent = async () => {
    await act(async () => {
        render(
            <MemoryRouter>
                <VacationRequests />
            </MemoryRouter>,
        );
    });
};

const getField = (label, index = 0) => screen.getAllByLabelText(label)[index];
const getButton = (name, index = 0) => screen.getAllByRole("button", { name })[index];

describe("Integración: VacationRequests", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.useRealTimers();

        getPendingVacationRequests.mockResolvedValue(pendingResponse);
        getReviewedVacationRequests.mockResolvedValue(reviewedResponse);
        approveVacationRequest.mockResolvedValue({
            message: "Solicitud aprobada correctamente",
            vacationRequest: {
                vacationRequestId: "vac-001",
                status: 1,
            },
        });
        rejectVacationRequest.mockResolvedValue({
            message: "Solicitud rechazada correctamente",
            vacationRequest: {
                vacationRequestId: "vac-001",
                status: 2,
            },
        });
    });

    it("carga y muestra solicitudes pendientes al entrar", async () => {
        await renderComponent();

        expect(
            screen.getByRole("heading", { name: "Solicitud de vacaciones" }),
        ).toBeInTheDocument();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();
        expect(screen.getByText("US800101HDF00003")).toBeInTheDocument();
        expect(
            screen.getByText("Página 1 de 1 | Total: 2 solicitudes"),
        ).toBeInTheDocument();

        expect(getPendingVacationRequests).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                limit: 6,
                search: "",
                startDate: "",
                endDate: "",
                status: "all",
            }),
        );

        expect(screen.queryByLabelText("Filtrar por estado")).toBeNull();
    });

    it("mantiene la tabla visible mientras carga una nueva búsqueda", async () => {
        let resolveSecondRequest;

        getPendingVacationRequests
            .mockResolvedValueOnce(pendingResponse)
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveSecondRequest = resolve;
                    }),
            );

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.change(getField("Buscar empleado"), {
            target: { value: "ana" },
        });

        await act(async () => {
            await wait(400);
        });

        expect(getPendingVacationRequests).toHaveBeenCalledTimes(2);

        expect(screen.getByText("Ana Pendiente")).toBeInTheDocument();
        expect(screen.queryByText("Cargando solicitudes...")).toBeNull();

        await act(async () => {
            resolveSecondRequest(singlePendingResponse);
        });

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();
    });

    it("hace búsqueda con debounce y manda el valor normalizado al servicio", async () => {
        getPendingVacationRequests
            .mockResolvedValueOnce(pendingResponse)
            .mockResolvedValueOnce(singlePendingResponse);

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.change(getField("Buscar empleado"), {
            target: { value: "  ana    pendiente  " },
        });

        await act(async () => {
            await wait(400);
        });

        await waitFor(() => {
            expect(getPendingVacationRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    search: "ana pendiente",
                    page: 1,
                }),
            );
        });
    });

    it("limpia la búsqueda si el usuario borra de us9 a us y usa el último valor", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        const input = getField("Buscar empleado");

        fireEvent.change(input, {
            target: { value: "us9" },
        });

        await act(async () => {
            await wait(100);
        });

        fireEvent.change(input, {
            target: { value: "us" },
        });

        await act(async () => {
            await wait(400);
        });

        await waitFor(() => {
            expect(getPendingVacationRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    search: "us",
                }),
            );
        });
    });

    it("cambia a vista revisadas y carga solicitudes revisadas", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.change(getField("Vista de solicitudes"), {
            target: { value: "reviewed" },
        });

        expect(
            screen.getByRole("heading", { name: "Solicitud de vacaciones" }),
        ).toBeInTheDocument();

        expect(await screen.findByText("Marta Revisada")).toBeInTheDocument();
        expect(screen.getByText("Aprobada")).toBeInTheDocument();

        expect(getReviewedVacationRequests).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                limit: 6,
                status: "all",
            }),
        );

        expect(getField("Filtrar por estado")).toHaveValue("all");
    });

    it("manda status approved al servicio cuando se filtra revisadas por aprobadas", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.change(getField("Vista de solicitudes"), {
            target: { value: "reviewed" },
        });

        expect(await screen.findByText("Marta Revisada")).toBeInTheDocument();

        fireEvent.change(getField("Filtrar por estado"), {
            target: { value: "approved" },
        });

        await waitFor(() => {
            expect(getReviewedVacationRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    status: "approved",
                    page: 1,
                }),
            );
        });
    });

    it("oculta el filtro de estado en pendientes y muestra solo aprobadas o rechazadas en revisadas", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();
        expect(screen.queryByLabelText("Filtrar por estado")).toBeNull();

        fireEvent.change(getField("Vista de solicitudes"), {
            target: { value: "reviewed" },
        });

        const statusSelect = getField("Filtrar por estado");

        expect(
            within(statusSelect).getByRole("option", { name: "Aprobadas" }),
        ).toBeInTheDocument();
        expect(
            within(statusSelect).getByRole("option", { name: "Rechazadas" }),
        ).toBeInTheDocument();
        expect(
            within(statusSelect).getByRole("option", { name: "Todas" }),
        ).toBeInTheDocument();
        expect(statusSelect).toHaveValue("all");
    });

    it("muestra error local si la fecha de inicio es posterior a la fecha de término", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.change(getField("Fecha de inicio"), {
            target: { value: "2026-06-10" },
        });

        fireEvent.change(getField("Fecha de término"), {
            target: { value: "2026-06-01" },
        });

        expect(
            await screen.findByText(
                "La fecha de inicio no puede ser posterior a la fecha de término",
            ),
        ).toBeInTheDocument();
    });

    it("muestra error cuando el servicio falla", async () => {
        getPendingVacationRequests.mockRejectedValueOnce(
            new Error("No se pudieron cargar las solicitudes"),
        );

        await renderComponent();

        expect(
            await screen.findByText("No se pudieron cargar las solicitudes"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("No hay solicitudes de vacaciones para mostrar"),
        ).toBeInTheDocument();
    });

    it("limpia filtros al presionar Limpiar", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        const input = getField("Buscar empleado");

        fireEvent.change(input, {
            target: { value: "ana" },
        });

        await act(async () => {
            await wait(400);
        });

        expect(input).toHaveValue("ana");

        fireEvent.change(getField("Fecha de inicio"), {
            target: { value: "2026-05-01" },
        });

        fireEvent.change(getField("Fecha de término"), {
            target: { value: "2026-05-10" },
        });

        fireEvent.click(getButton("Limpiar"));

        expect(input).toHaveValue("");
        expect(getField("Fecha de inicio")).toHaveValue("");
        expect(getField("Fecha de término")).toHaveValue("");
    });

    it("abre modal de confirmación al presionar aprobar", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Aprobar solicitud")[0]);

        expect(
            screen.getByRole("dialog", { name: "Aprobar solicitud" }),
        ).toBeInTheDocument();
        expect(screen.getAllByText("Ana Pendiente").length).toBeGreaterThan(0);
        expect(
            screen.getByText(/Esta acción moverá la solicitud a revisadas/),
        ).toBeInTheDocument();

        expect(approveVacationRequest).not.toHaveBeenCalled();
    });

    it("cierra modal de aprobación al presionar cancelar", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Aprobar solicitud")[0]);

        expect(
            screen.getByRole("dialog", { name: "Aprobar solicitud" }),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(
            screen.queryByRole("dialog", { name: "Aprobar solicitud" }),
        ).toBeNull();
    });

    it("aprueba una solicitud desde el modal y refresca la tabla", async () => {
        getPendingVacationRequests
            .mockResolvedValueOnce(pendingResponse)
            .mockResolvedValueOnce({
                data: [pendingRequests[1]],
                pagination: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            });

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Aprobar solicitud")[0]);

        expect(
            screen.getByRole("dialog", { name: "Aprobar solicitud" }),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));

        await waitFor(() => {
            expect(approveVacationRequest).toHaveBeenCalledWith("vac-001");
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("dialog", { name: "Aprobar solicitud" }),
            ).toBeNull();
        });

        expect(getPendingVacationRequests).toHaveBeenCalledTimes(2);
        expect(await screen.findByText("Luis Vacaciones")).toBeInTheDocument();
        expect(screen.queryByText("Ana Pendiente")).toBeNull();
    });

    it("muestra error dentro del modal si falla la aprobación", async () => {
        approveVacationRequest.mockRejectedValueOnce(
            new Error("La solicitud ya fue revisada"),
        );

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Aprobar solicitud")[0]);

        fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));

        expect(
            await screen.findByText("La solicitud ya fue revisada"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("dialog", { name: "Aprobar solicitud" }),
        ).toBeInTheDocument();
    });

    it("no muestra alert global cuando el error de aprobación se muestra en el modal", async () => {
        approveVacationRequest.mockRejectedValueOnce(
            new Error("No se pudo aprobar la solicitud"),
        );

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Aprobar solicitud")[0]);
        fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));

        expect(
            await screen.findByText("No se pudo aprobar la solicitud"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("dialog", { name: "Aprobar solicitud" }),
        ).toBeInTheDocument();

        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("muestra mensaje de éxito al aprobar una solicitud", async () => {
        getPendingVacationRequests
            .mockResolvedValueOnce(pendingResponse)
            .mockResolvedValueOnce({
                data: [pendingRequests[1]],
                pagination: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            });

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Aprobar solicitud")[0]);
        fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));

        expect(
            await screen.findByText("Solicitud de vacaciones aprobada con éxito"),
        ).toBeInTheDocument();

        expect(approveVacationRequest).toHaveBeenCalledWith("vac-001");
    });

    it("abre modal de confirmación al presionar rechazar", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Rechazar solicitud")[0]);

        expect(
            screen.getByRole("dialog", { name: "Rechazar solicitud" }),
        ).toBeInTheDocument();
        expect(screen.getAllByText("Ana Pendiente").length).toBeGreaterThan(0);
        expect(
            screen.getByText(/Esta acción moverá la solicitud a revisadas/),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText("Motivo del rechazo (opcional)"),
        ).toBeInTheDocument();
        expect(screen.getByText("0/500")).toBeInTheDocument();

        expect(rejectVacationRequest).not.toHaveBeenCalled();
    });

    it("cierra modal de rechazo al presionar cancelar", async () => {
        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Rechazar solicitud")[0]);

        expect(
            screen.getByRole("dialog", { name: "Rechazar solicitud" }),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(
            screen.queryByRole("dialog", { name: "Rechazar solicitud" }),
        ).toBeNull();
    });

    it("rechaza una solicitud desde el modal y refresca la tabla", async () => {
        getPendingVacationRequests
            .mockResolvedValueOnce(pendingResponse)
            .mockResolvedValueOnce({
                data: [pendingRequests[1]],
                pagination: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            });

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Rechazar solicitud")[0]);

        expect(
            screen.getByRole("dialog", { name: "Rechazar solicitud" }),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: "No hay disponibilidad para esas fechas" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        await waitFor(() => {
            expect(rejectVacationRequest).toHaveBeenCalledWith(
                "vac-001",
                "No hay disponibilidad para esas fechas",
            );
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("dialog", { name: "Rechazar solicitud" }),
            ).toBeNull();
        });

        expect(getPendingVacationRequests).toHaveBeenCalledTimes(2);
        expect(await screen.findByText("Luis Vacaciones")).toBeInTheDocument();
        expect(screen.queryByText("Ana Pendiente")).toBeNull();
    });

    it("permite rechazar una solicitud sin retroalimentación", async () => {
        getPendingVacationRequests
            .mockResolvedValueOnce(pendingResponse)
            .mockResolvedValueOnce({
                data: [pendingRequests[1]],
                pagination: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            });

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Rechazar solicitud")[0]);

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        await waitFor(() => {
            expect(rejectVacationRequest).toHaveBeenCalledWith("vac-001", "");
        });

        expect(
            await screen.findByText("Solicitud de vacaciones rechazada con éxito"),
        ).toBeInTheDocument();
    });

    it("muestra error dentro del modal si falla el rechazo", async () => {
        rejectVacationRequest.mockRejectedValueOnce(
            new Error("La solicitud ya fue revisada"),
        );

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Rechazar solicitud")[0]);

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: "No procede por empalme de fechas" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        await waitFor(() => {
            expect(rejectVacationRequest).toHaveBeenCalledWith(
                "vac-001",
                "No procede por empalme de fechas",
            );
        });

        expect(
            await screen.findByText("La solicitud ya fue revisada"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("dialog", { name: "Rechazar solicitud" }),
        ).toBeInTheDocument();
    });

    it("no muestra alert global cuando el error de rechazo se muestra en el modal", async () => {
        rejectVacationRequest.mockRejectedValueOnce(
            new Error("No se pudo rechazar la solicitud"),
        );

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Rechazar solicitud")[0]);

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: "No se puede aprobar en estas fechas" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        await waitFor(() => {
            expect(rejectVacationRequest).toHaveBeenCalledWith(
                "vac-001",
                "No se puede aprobar en estas fechas",
            );
        });

        expect(
            await screen.findByText("No se pudo rechazar la solicitud"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("dialog", { name: "Rechazar solicitud" }),
        ).toBeInTheDocument();

        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("muestra mensaje de éxito al rechazar una solicitud", async () => {
        getPendingVacationRequests
            .mockResolvedValueOnce(pendingResponse)
            .mockResolvedValueOnce({
                data: [pendingRequests[1]],
                pagination: {
                    page: 1,
                    limit: 6,
                    total: 1,
                    totalPages: 1,
                },
            });

        await renderComponent();

        expect(await screen.findByText("Ana Pendiente")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Rechazar solicitud")[0]);

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: "No hay disponibilidad para esas fechas" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        expect(
            await screen.findByText("Solicitud de vacaciones rechazada con éxito"),
        ).toBeInTheDocument();

        expect(rejectVacationRequest).toHaveBeenCalledWith(
            "vac-001",
            "No hay disponibilidad para esas fechas",
        );
    });
});
