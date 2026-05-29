import { useRef, useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from "@testing-library/react";
import {
    MemoryRouter,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import VacationList from "../../pages/vacaciones";
import { useCalendarSearchParams } from "../../hooks/pages/useCalendarSearchParams";
import {
    getFutureVacationRequests,
    getPastVacationRequests,
} from "../../services/vacationRequestService";
import {
    deleteVacationRequest,
    getRemainingVacations,
    updateVacationRequestDates,
} from "../../services/vacationService";
import { getEventsInRange } from "../../services/calendarService";

vi.mock("../../services/vacationRequestService", () => ({
    getFutureVacationRequests: vi.fn(),
    getPastVacationRequests: vi.fn(),
}));

vi.mock("../../services/vacationService", () => ({
    deleteVacationRequest: vi.fn(),
    getRemainingVacations: vi.fn(),
    updateVacationRequestDates: vi.fn(),
}));

vi.mock("../../services/calendarService", () => ({
    getEventsInRange: vi.fn(),
    getOwnEmployeeId: vi.fn(() => "own-employee"),
    getCalendarViewerRole: vi.fn(() => "Trabajador"),
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

vi.mock("../../components/atoms/dateField", () => ({
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

const buildRequest = ({
    id,
    description,
    startDate,
    endDate,
    status = 0,
    statusLabel = "Pendiente",
    usedDays = 2,
}) => ({
    vacationRequestId: id,
    employeeId: "own-employee",
    startDate,
    endDate,
    usedDays,
    status,
    statusLabel,
    description,
});

const futureRequests = [
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174000",
        description: "Futura pendiente 1",
        startDate: "2026-06-15T00:00:00.000Z",
        endDate: "2026-06-16T00:00:00.000Z",
    }),
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174001",
        description: "Futura aprobada 2",
        startDate: "2026-06-17T00:00:00.000Z",
        endDate: "2026-06-18T00:00:00.000Z",
        status: 1,
        statusLabel: "Aprobada",
    }),
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174002",
        description: "Futura rechazada 3",
        startDate: "2026-06-19T00:00:00.000Z",
        endDate: "2026-06-20T00:00:00.000Z",
        status: 2,
        statusLabel: "Rechazada",
    }),
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174003",
        description: "Futura pendiente 4",
        startDate: "2026-06-21T00:00:00.000Z",
        endDate: "2026-06-22T00:00:00.000Z",
    }),
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174004",
        description: "Futura pendiente 5",
        startDate: "2026-06-23T00:00:00.000Z",
        endDate: "2026-06-24T00:00:00.000Z",
    }),
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174005",
        description: "Futura pendiente 6",
        startDate: "2026-06-25T00:00:00.000Z",
        endDate: "2026-06-26T00:00:00.000Z",
    }),
];

const secondFuturePage = [
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174006",
        description: "Futura página 2",
        startDate: "2026-06-27T00:00:00.000Z",
        endDate: "2026-06-28T00:00:00.000Z",
    }),
];

const pastRequests = [
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174010",
        description: "Pasada aprobada",
        startDate: "2026-05-10T00:00:00.000Z",
        endDate: "2026-05-12T00:00:00.000Z",
        status: 1,
        statusLabel: "Aprobada",
    }),
    buildRequest({
        id: "123e4567-e89b-12d3-a456-426614174011",
        description: "Inicia hoy",
        startDate: "2026-05-22T00:00:00.000Z",
        endDate: "2026-05-23T00:00:00.000Z",
        status: 0,
        statusLabel: "Pendiente",
    }),
];

const futureResponse = {
    data: futureRequests,
    pagination: {
        page: 1,
        limit: 6,
        total: 7,
        totalPages: 2,
    },
};

const futureSecondPageResponse = {
    data: secondFuturePage,
    pagination: {
        page: 2,
        limit: 6,
        total: 7,
        totalPages: 2,
    },
};

const pastResponse = {
    data: pastRequests,
    pagination: {
        page: 1,
        limit: 6,
        total: 2,
        totalPages: 1,
    },
};

const renderVacationList = () =>
    render(
        <MemoryRouter initialEntries={["/app/vacaciones"]}>
            <Routes>
                <Route path="/app/vacaciones" element={<VacationList />} />
            </Routes>
        </MemoryRouter>,
    );

const CalendarDeepLinkTarget = () => {
    const location = useLocation();
    const [selectedVacation, setSelectedVacation] = useState(null);
    const calendarRef = useRef({
        getApi: () => ({
            gotoDate: vi.fn(),
        }),
    });

    useCalendarSearchParams({
        calendarRef,
        openCalendarItemDetail: setSelectedVacation,
        reloadVisibleRange: vi.fn(),
        setCalendarMode: vi.fn(),
    });

    return (
        <div>
            <p>Calendario destino</p>
            <p>{location.search}</p>
            {selectedVacation ? (
                <p>Vacación abierta: {selectedVacation.employeeName}</p>
            ) : null}
        </div>
    );
};

const renderVacationListWithCalendar = () =>
    render(
        <MemoryRouter initialEntries={["/app/vacaciones"]}>
            <Routes>
                <Route path="/app/vacaciones" element={<VacationList />} />
                <Route
                    path="/app/calendario"
                    element={<CalendarDeepLinkTarget />}
                />
            </Routes>
        </MemoryRouter>,
    );

describe("Integración: VacationList", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getFutureVacationRequests.mockResolvedValue(futureResponse);
        getPastVacationRequests.mockResolvedValue(pastResponse);
        getRemainingVacations.mockResolvedValue({
            remainingVacations: 10,
            startDate: "2026-01-01",
            endDate: "2026-12-31",
        });
        updateVacationRequestDates.mockResolvedValue({
            vacationRequestId: "123e4567-e89b-12d3-a456-426614174000",
            startDate: "2026-06-16",
            endDate: "2026-06-17",
            usedDays: 2,
        });
        deleteVacationRequest.mockResolvedValue({
            vacationRequestId: "123e4567-e89b-12d3-a456-426614174000",
        });
        getEventsInRange.mockResolvedValue([
            {
                focus: "vacaciones",
                vacationId: "123e4567-e89b-12d3-a456-426614174000",
                employeeId: "own-employee",
                employeeName: "Futura pendiente 1",
                startDate: "2026-06-15",
                endDate: "2026-06-16",
                status: 0,
                usedDays: 2,
            },
        ]);
    });

    it("carga como máximo las vacaciones de la página actual y respeta la paginación", async () => {
        getFutureVacationRequests
            .mockResolvedValueOnce(futureResponse)
            .mockResolvedValueOnce(futureSecondPageResponse);

        renderVacationList();

        expect(await screen.findByText("Futura pendiente 1")).toBeInTheDocument();
        expect(screen.getByText("Futura pendiente 6")).toBeInTheDocument();
        expect(screen.queryByText("Futura página 2")).toBeNull();
        expect(screen.getAllByTitle("Ver detalle")).toHaveLength(6);
        expect(
            screen.getByText("Página 1 de 2 | Total: 7 vacaciones"),
        ).toBeInTheDocument();

        expect(getFutureVacationRequests).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                limit: 6,
            }),
        );

        fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

        expect(await screen.findByText("Futura página 2")).toBeInTheDocument();
        expect(screen.queryByText("Futura pendiente 1")).toBeNull();
        expect(
            screen.getByText("Página 2 de 2 | Total: 7 vacaciones"),
        ).toBeInTheDocument();
    });

    it("muestra vacaciones pasadas y las que inician el mismo día en la vista pasadas", async () => {
        renderVacationList();

        expect(await screen.findByText("Futura pendiente 1")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Vista de vacaciones"), {
            target: { value: "past" },
        });

        expect(await screen.findByText("Pasada aprobada")).toBeInTheDocument();
        expect(screen.getByText("Inicia hoy")).toBeInTheDocument();
        expect(screen.queryByText("Futura pendiente 1")).toBeNull();
        expect(getPastVacationRequests).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                limit: 6,
                status: "all",
            }),
        );

        const statusSelect = screen.getByLabelText("Filtrar por estado");

        expect(
            within(statusSelect).queryByRole("option", { name: "Pendientes" }),
        ).toBeNull();
        expect(
            within(statusSelect).getByRole("option", { name: "Aprobadas" }),
        ).toBeInTheDocument();
        expect(
            within(statusSelect).getByRole("option", { name: "Rechazadas" }),
        ).toBeInTheDocument();
    });

    it("reinicia el filtro pendiente al cambiar a vacaciones pasadas", async () => {
        renderVacationList();

        expect(await screen.findByText("Futura pendiente 1")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Filtrar por estado"), {
            target: { value: "pending" },
        });

        await waitFor(() => {
            expect(getFutureVacationRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    status: "pending",
                    page: 1,
                }),
            );
        });

        fireEvent.change(screen.getByLabelText("Vista de vacaciones"), {
            target: { value: "past" },
        });

        await waitFor(() => {
            expect(getPastVacationRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    status: "all",
                    page: 1,
                }),
            );
        });

        expect(screen.getByLabelText("Filtrar por estado")).toHaveValue("all");
    });

    it("manda filtros de estado y rango de fechas al servicio de la vista activa", async () => {
        renderVacationList();

        expect(await screen.findByText("Futura pendiente 1")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Filtrar por estado"), {
            target: { value: "approved" },
        });

        await waitFor(() => {
            expect(getFutureVacationRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    status: "approved",
                    page: 1,
                }),
            );
        });

        fireEvent.change(screen.getByLabelText("Fecha de inicio"), {
            target: { value: "2026-06-01" },
        });

        fireEvent.change(screen.getByLabelText("Fecha de término"), {
            target: { value: "2026-06-30" },
        });

        await waitFor(() => {
            expect(getFutureVacationRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    status: "approved",
                    startDate: "2026-06-01",
                    endDate: "2026-06-30",
                }),
            );
        });
    });

    it("redirige al calendario y abre la vacación correspondiente al presionar el ojo", async () => {
        renderVacationListWithCalendar();

        expect(await screen.findByText("Futura pendiente 1")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Ver detalle")[0]);

        expect(await screen.findByText("Calendario destino")).toBeInTheDocument();
        expect(
            await screen.findByText("Vacación abierta: Futura pendiente 1"),
        ).toBeInTheDocument();
        expect(screen.getByText(/type=vacacion/)).toBeInTheDocument();
        expect(screen.getByText(/date=2026-06-15/)).toBeInTheDocument();
        expect(
            screen.getByText(/id=123e4567-e89b-12d3-a456-426614174000/),
        ).toBeInTheDocument();
        expect(screen.getByText(/employeeId=own-employee/)).toBeInTheDocument();
        expect(getEventsInRange).toHaveBeenCalledWith(
            "own-employee",
            "2026-06-15",
            "2026-06-16",
        );
    });

    it("abre el detalle en la misma vista si la vacación está rechazada", async () => {
        renderVacationListWithCalendar();

        expect(await screen.findByText("Futura rechazada 3")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Ver detalle")[2]);

        const dialog = await screen.findByRole("dialog");

        expect(
            within(dialog).getByText("Vacaciones Rechazadas"),
        ).toBeInTheDocument();
        expect(within(dialog).getByText("Rechazado")).toBeInTheDocument();
        expect(within(dialog).getByText("Futura rechazada 3")).toBeInTheDocument();
        expect(screen.queryByText("Calendario destino")).toBeNull();
    });

    it("abre el modal de modificación desde una vacación futura pendiente sin mostrar datos del empleado", async () => {
        renderVacationList();

        expect(await screen.findByText("Futura pendiente 1")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Modificar vacación")[0]);

        const dialog = await screen.findByRole("dialog");

        expect(
            within(dialog).getByText("Modificar vacaciones"),
        ).toBeInTheDocument();
        expect(within(dialog).queryByText("Nombre del trabajador")).toBeNull();
        expect(within(dialog).queryByText("CURP")).toBeNull();
        expect(within(dialog).getByLabelText("Fecha de inicio")).toHaveValue(
            "2026-06-15",
        );
        expect(within(dialog).getByLabelText("Fecha de fin")).toHaveValue(
            "2026-06-16",
        );
        expect(getRemainingVacations).toHaveBeenCalledWith("own-employee");
    });

    it("abre el modal de borrado y elimina una vacación futura sin mostrar datos del empleado", async () => {
        renderVacationList();

        expect(await screen.findByText("Futura pendiente 1")).toBeInTheDocument();

        fireEvent.click(screen.getAllByTitle("Borrar vacación")[0]);

        const dialog = await screen.findByRole("dialog", {
            name: /eliminar vacaciones/i,
        });

        expect(
            within(dialog).getByText(
                "Está a punto de eliminar la solicitud de vacaciones. Esta acción no se puede deshacer.",
            ),
        ).toBeInTheDocument();
        expect(within(dialog).queryByText(/Futura pendiente 1/)).toBeNull();

        fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));

        await waitFor(() => {
            expect(deleteVacationRequest).toHaveBeenCalledWith(
                "123e4567-e89b-12d3-a456-426614174000",
            );
        });
    });
});
