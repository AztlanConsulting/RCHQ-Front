import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterEventModal from "../../components/organism/evento/registerEventModal";
import {
    createAbsenceService,
    getAbsenceAddData,
    getCalendarViewerRole,
} from "../../services/calendarService";
import { getEventTypes } from "../../services/eventService";

vi.mock("../../services/calendarService", () => ({
    createAbsenceService: vi.fn(),
    getAbsenceAddData: vi.fn(),
    getCalendarViewerRole: vi.fn(),
}));

vi.mock("../../services/eventService", () => ({
    createHouseEvent: vi.fn(),
    getEventTypes: vi.fn(),
}));

vi.mock("../../components/atoms/alerts", () => ({
    default: ({ message }) => <div role="alert">{message}</div>,
}));

vi.mock("../../components/atoms/dateField", () => ({
    default: ({ label, value, onChange, placeholder }) => (
        <label>
            {label}
            <input
                aria-label={label}
                type="date"
                value={value ?? ""}
                placeholder={placeholder}
                onChange={onChange}
            />
        </label>
    ),
}));

vi.mock("/absence-black.svg", () => ({ default: "absence-black.svg" }));
vi.mock("/global-black.svg", () => ({ default: "global-black.svg" }));
vi.mock("/house-black.svg", () => ({ default: "house-black.svg" }));
vi.mock("/personal-black.svg", () => ({ default: "personal-black.svg" }));
vi.mock("/vacation-black.svg", () => ({ default: "vacation-black.svg" }));
vi.mock("/time.svg", () => ({ default: "time.svg" }));
vi.mock("/chevron-down.svg", () => ({ default: "chevron-down.svg" }));

const employees = [
    {
        employeeId: "emp-1",
        name: "Ana Lopez",
        houseId: "house-1",
        picture: null,
    },
];

const absenceTypes = [
    {
        absenceTypeId: "type-medica",
        name: "Medica",
    },
];

const toDateInputValue = (date) => {
    const next = new Date(date);
    const year = next.getFullYear();
    const month = String(next.getMonth() + 1).padStart(2, "0");
    const day = String(next.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getValidDates = () => {
    const today = new Date();
    const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7,
    );
    const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 8,
    );

    return {
        startDate: toDateInputValue(startDate),
        endDate: toDateInputValue(endDate),
    };
};

const apiError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const renderModal = (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const onFeedback = vi.fn();
    const dates = getValidDates();

    render(
        <RegisterEventModal
            isOpen
            onClose={onClose}
            onSuccess={onSuccess}
            onFeedback={onFeedback}
            initialStartDate={dates.startDate}
            initialEndDate={dates.endDate}
            {...props}
        />,
    );

    return {
        onClose,
        onSuccess,
        onFeedback,
        dates: {
            startDate: props.initialStartDate ?? dates.startDate,
            endDate: props.initialEndDate ?? dates.endDate,
        },
    };
};

const openAbsenceForm = async () => {
    fireEvent.click(screen.getByRole("radio", { name: "Ausencias" }));

    await waitFor(() => {
        expect(getAbsenceAddData).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
        expect(
            screen.getByRole("button", { name: /selecciona el empleado/i }),
        ).not.toBeDisabled();
    });
};

const selectOption = async (buttonName, optionName) => {
    fireEvent.click(screen.getByRole("button", { name: buttonName }));

    const option = await screen.findByRole("option", { name: optionName });
    fireEvent.click(option);
};

const fillRequiredAbsenceFields = async () => {
    await selectOption(/selecciona el empleado/i, "Ana Lopez");
    await selectOption(/selecciona tipo de ausencia/i, "Medica");
    fireEvent.change(screen.getByPlaceholderText(/agregar descrip/i), {
        target: { value: "Reposo medico por indicacion del doctor" },
    });
};

const submitAbsence = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^confirmar$/i }));
    });
};

describe("Integracion: coordinador registra una ausencia", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getCalendarViewerRole.mockReturnValue("Coordinador");
        getEventTypes.mockResolvedValue([]);
        getAbsenceAddData.mockResolvedValue({
            employees,
            absenceTypes,
        });
        createAbsenceService.mockResolvedValue({
            absenceId: "absence-1",
        });
    });

    it("muestra la opcion de ausencias y carga empleados/tipos para el coordinador", async () => {
        renderModal();

        expect(
            screen.getByRole("radio", { name: "Ausencias" }),
        ).toBeInTheDocument();

        await openAbsenceForm();

        fireEvent.click(
            screen.getByRole("button", { name: /selecciona el empleado/i }),
        );
        expect(
            await screen.findByRole("option", { name: "Ana Lopez" }),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: /selecciona tipo de ausencia/i }),
        );
        expect(
            await screen.findByRole("option", { name: "Medica" }),
        ).toBeInTheDocument();
    });

    it("registra una ausencia sin evidencia y manda los datos correctos", async () => {
        const absence = {
            absenceId: "absence-1",
            employeeId: "emp-1",
            absenceTypeId: "type-medica",
        };
        createAbsenceService.mockResolvedValueOnce(absence);
        const { dates, onClose, onFeedback, onSuccess } = renderModal();

        await openAbsenceForm();
        await fillRequiredAbsenceFields();
        await submitAbsence();

        await waitFor(() => {
            expect(createAbsenceService).toHaveBeenCalledTimes(1);
        });

        expect(createAbsenceService).toHaveBeenCalledWith("emp-1", {
            absenceTypeId: "type-medica",
            startDate: dates.startDate,
            endDate: dates.endDate,
            description: "Reposo medico por indicacion del doctor",
            file: undefined,
        });
        expect(onFeedback).toHaveBeenCalledWith({
            type: "success",
            message: "Ausencia registrada correctamente",
        });
        expect(onSuccess).toHaveBeenCalledWith(absence);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("registra una ausencia con evidencia y manda el archivo", async () => {
        const evidenceFile = new File(["pdf"], "evidencia.pdf", {
            type: "application/pdf",
        });
        const { dates } = renderModal();

        await openAbsenceForm();
        await fillRequiredAbsenceFields();
        fireEvent.change(document.querySelector("#absence-evidence"), {
            target: { files: [evidenceFile] },
        });
        await submitAbsence();

        await waitFor(() => {
            expect(createAbsenceService).toHaveBeenCalledTimes(1);
        });

        expect(createAbsenceService).toHaveBeenCalledWith("emp-1", {
            absenceTypeId: "type-medica",
            startDate: dates.startDate,
            endDate: dates.endDate,
            description: "Reposo medico por indicacion del doctor",
            file: evidenceFile,
        });
    });

    it("muestra Campo obligatorio y no envia si faltan datos", async () => {
        renderModal({
            initialStartDate: "",
            initialEndDate: "",
        });

        await openAbsenceForm();
        await submitAbsence();

        expect(screen.getAllByText("Campo obligatorio").length).toBeGreaterThan(
            0,
        );
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("muestra error de usuario no encontrado cuando el backend rechaza el empleado", async () => {
        const { onClose, onSuccess } = renderModal();
        createAbsenceService.mockRejectedValueOnce(
            apiError("usuario no encontrado", 404),
        );

        await openAbsenceForm();
        await fillRequiredAbsenceFields();
        await submitAbsence();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "usuario no encontrado",
        );
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("muestra error de permisos insuficientes si el servicio rechaza la operacion", async () => {
        const { onClose, onSuccess } = renderModal();
        createAbsenceService.mockRejectedValueOnce(
            apiError("Permisos insuficientes", 403),
        );

        await openAbsenceForm();
        await fillRequiredAbsenceFields();
        await submitAbsence();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Permisos insuficientes",
        );
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("muestra error y bloquea el envio si la evidencia tiene formato invalido", async () => {
        const invalidFile = new File(["texto"], "evidencia.txt", {
            type: "text/plain",
        });

        renderModal();

        await openAbsenceForm();
        await fillRequiredAbsenceFields();
        fireEvent.change(document.querySelector("#absence-evidence"), {
            target: { files: [invalidFile] },
        });
        await submitAbsence();

        expect(
            screen.getAllByText("Formato invalido de ausencias").length,
        ).toBeGreaterThan(0);
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("oculta la opcion de ausencias para un rol diferente a coordinador o admin", () => {
        getCalendarViewerRole.mockReturnValue("Trabajador");

        renderModal();

        expect(
            screen.queryByRole("radio", { name: "Ausencias" }),
        ).not.toBeInTheDocument();
    });
});
