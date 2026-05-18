import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAbsenceForm } from "../../hooks/pages/useAbsenceForm";
import {
    createAbsenceService,
    getAbsenceAddData,
} from "../../services/calendarService";

vi.mock("../../services/calendarService", () => ({
    createAbsenceService: vi.fn(),
    getAbsenceAddData: vi.fn(),
}));

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

const offsetDate = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return toDateInputValue(next);
};

const apiError = (message, status, errors) => {
    const error = new Error(message);
    error.status = status;
    error.errors = errors;
    return error;
};

const setupHook = async (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const onFeedback = vi.fn();
    const onValidationAlert = vi.fn();

    const renderResult = renderHook(() =>
        useAbsenceForm({
            isOpen: true,
            onClose,
            onSuccess,
            onFeedback,
            onValidationAlert,
            ...props,
        }),
    );

    await waitFor(() => {
        expect(renderResult.result.current.isLoadingOptions).toBe(false);
    });

    return {
        ...renderResult,
        onClose,
        onSuccess,
        onFeedback,
        onValidationAlert,
    };
};

const getValidForm = (result, overrides = {}) => ({
    employeeId: "emp-1",
    absenceTypeId: "type-medica",
    startDate: offsetDate(result.current.minStartDate, 35),
    endDate: offsetDate(result.current.minStartDate, 36),
    description: "Reposo medico por indicacion del doctor",
    ...overrides,
});

const fillAbsenceForm = (result, overrides = {}) => {
    const form = getValidForm(result, overrides);

    act(() => {
        Object.entries(form).forEach(([field, value]) => {
            result.current.setField(field, value);
        });
    });

    return form;
};

const submitForm = async (result) => {
    await act(async () => {
        await result.current.handleSubmit();
    });
};

describe("useAbsenceForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getAbsenceAddData.mockResolvedValue({
            employees,
            absenceTypes,
        });
        createAbsenceService.mockResolvedValue({
            absenceId: "absence-1",
        });
    });

    it("carga empleados y tipos de ausencia para registrar", async () => {
        const { result } = await setupHook();

        expect(getAbsenceAddData).toHaveBeenCalledTimes(1);
        expect(result.current.employeeOptions).toEqual([
            {
                value: "emp-1",
                label: "Ana Lopez",
                houseId: "house-1",
                picture: "",
            },
        ]);
        expect(result.current.absenceTypeOptions).toEqual([
            {
                value: "type-medica",
                label: "Medica",
            },
        ]);
    });

    it.each([
        ["employeeId", { employeeId: "" }],
        ["absenceTypeId", { absenceTypeId: "" }],
        ["startDate", { startDate: "" }],
        ["endDate", { endDate: "" }],
        ["description", { description: "" }],
    ])(
        "muestra Campo obligatorio cuando falta %s y no envia la ausencia",
        async (field, override) => {
            const { result, onValidationAlert } = await setupHook();

            fillAbsenceForm(result, override);
            await submitForm(result);

            expect(result.current.errors[field]).toBe("Campo obligatorio");
            expect(onValidationAlert).toHaveBeenLastCalledWith(
                expect.stringContaining("Campo obligatorio"),
            );
            expect(createAbsenceService).not.toHaveBeenCalled();
        },
    );

    it("rechaza fecha de fin mayor a un anio desde el dia actual", async () => {
        const { result } = await setupHook();

        fillAbsenceForm(result, {
            endDate: offsetDate(result.current.maxEndDate, 1),
        });
        await submitForm(result);

        expect(result.current.errors.endDate).toBe(
            "Fecha de fin no puede ser mayor a un año.",
        );
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("rechaza fecha de inicio menor a un mes desde el dia actual", async () => {
        const { result } = await setupHook();

        fillAbsenceForm(result, {
            startDate: offsetDate(result.current.minStartDate, -1),
        });
        await submitForm(result);

        expect(result.current.errors.startDate).toBe(
            "Fecha de inicio no puede ser menor a un mes antes del día actual.",
        );
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it.each([
        ["inicio mayor a fin", { startDate: "2026-06-10", endDate: "2026-06-01" }],
        ["fin menor a inicio", { startDate: "2026-06-10", endDate: "2026-06-01" }],
    ])("rechaza una ausencia con fecha de %s", async (_caseName, override) => {
        const { result } = await setupHook();

        fillAbsenceForm(result, override);
        await submitForm(result);

        expect(result.current.errors.startDate).toBe(
            "Fecha de inicio no puede ser mayor a la de fin",
        );
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("rechaza fechas con formato distinto a YYYY-MM-DD", async () => {
        const { result } = await setupHook();

        fillAbsenceForm(result, {
            startDate: "2026/06/01",
        });
        await submitForm(result);

        expect(result.current.errors.startDate).toBe(
            "Fecha solo puede tener un formato YYYY-MM-DD",
        );
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("rechaza fechas con tamanio diferente a 10 caracteres", async () => {
        const { result } = await setupHook();

        fillAbsenceForm(result, {
            startDate: "2026-6-1",
        });
        await submitForm(result);

        expect(result.current.errors.startDate).toBe(
            "El tama\u00f1o de la fecha debe ser de 10 caracteres",
        );
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("rechaza descripcion mayor a 200 caracteres", async () => {
        const { result } = await setupHook();

        fillAbsenceForm(result, {
            description: "a".repeat(201),
        });
        await submitForm(result);

        expect(result.current.errors.description).toBe(
            "Descripci\u00f3n no puede ser mayor a 200 caracteres",
        );
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("no inserta emojis ni caracteres especiales en la descripcion", async () => {
        const { result } = await setupHook();

        const form = fillAbsenceForm(result);

        act(() => {
            result.current.setField(
                "description",
                `${form.description} @$😀`,
            );
        });

        expect(result.current.form.description).toBe(form.description);

        await submitForm(result);

        expect(createAbsenceService).toHaveBeenCalledWith("emp-1", {
            absenceTypeId: form.absenceTypeId,
            startDate: form.startDate,
            endDate: form.endDate,
            description: form.description,
            file: undefined,
        });
    });

    it("rechaza evidencia con formato invalido", async () => {
        const { result } = await setupHook();
        const invalidFile = new File(["texto"], "evidencia.txt", {
            type: "text/plain",
        });

        fillAbsenceForm(result);
        act(() => {
            result.current.handleEvidenceChange({
                target: { files: [invalidFile] },
            });
        });
        await submitForm(result);

        expect(result.current.errors.file).toBe("Formato invalido de ausencias");
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it("rechaza evidencia con tamanio superior a 10mb", async () => {
        const { result } = await setupHook();
        const oversizedFile = new File(
            [new Uint8Array(10 * 1024 * 1024 + 1)],
            "evidencia.pdf",
            { type: "application/pdf" },
        );

        fillAbsenceForm(result);
        act(() => {
            result.current.handleEvidenceChange({
                target: { files: [oversizedFile] },
            });
        });
        await submitForm(result);

        expect(result.current.errors.file).toBe("tama\u00f1o superior a 10mb");
        expect(createAbsenceService).not.toHaveBeenCalled();
    });

    it.each([
        [
            "empleado que no esta en la base de datos",
            { employeeId: "emp-missing" },
            apiError("usuario no encontrado", 404),
            "usuario no encontrado",
        ],
        [
            "empleado dado de baja",
            { employeeId: "emp-inactive" },
            apiError("usuario no encontrado", 404),
            "usuario no encontrado",
        ],
        [
            "tipo de ausencia que no esta en la base de datos",
            { absenceTypeId: "type-missing" },
            apiError("tipo de ausencia no encontrado", 404),
            "tipo de ausencia no encontrado",
        ],
        [
            "empalme con vacaciones",
            {},
            apiError("Ya hay una vacaci\u00f3n registrada para esa fecha", 406),
            "Ya hay una vacaci\u00f3n registrada para esa fecha",
        ],
        [
            "trabajador de otra casa hogar",
            { employeeId: "emp-other-house" },
            apiError("usuario no encontrado", 404),
            "usuario no encontrado",
        ],
        [
            "limite de 10 ausencias en la misma fecha",
            {},
            apiError(
                "Limite de 10 ausencias registradas en una misma fecha",
                406,
            ),
            "Limite de 10 ausencias registradas en una misma fecha",
        ],
        [
            "rol diferente a coordinador",
            {},
            apiError("Permisos insuficientes", 403),
            "Permisos insuficientes",
        ],
        [
            "sin permiso de agregar ausencia",
            {},
            apiError("Permisos insuficientes", 403),
            "Permisos insuficientes",
        ],
    ])(
        "muestra error de servidor para %s y no completa el registro",
        async (_caseName, override, error, expectedMessage) => {
            const { result, onClose, onSuccess } = await setupHook();

            createAbsenceService.mockRejectedValueOnce(error);
            fillAbsenceForm(result, override);
            await submitForm(result);

            expect(createAbsenceService).toHaveBeenCalledTimes(1);
            expect(result.current.serverError).toBe(expectedMessage);
            expect(onSuccess).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
        },
    );

    it("registra una ausencia sin evidencia con los datos correctos", async () => {
        const { result, onClose, onFeedback, onSuccess } = await setupHook();
        const absence = {
            absenceId: "absence-1",
            employeeId: "emp-1",
            absenceTypeId: "type-medica",
        };

        createAbsenceService.mockResolvedValueOnce(absence);
        const form = fillAbsenceForm(result);
        await submitForm(result);

        expect(createAbsenceService).toHaveBeenCalledWith("emp-1", {
            absenceTypeId: form.absenceTypeId,
            startDate: form.startDate,
            endDate: form.endDate,
            description: form.description,
            file: undefined,
        });
        expect(onFeedback).toHaveBeenCalledWith({
            type: "success",
            message: "Ausencia registrada correctamente",
        });
        expect(onSuccess).toHaveBeenCalledWith(absence);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("registra una ausencia con evidencia con los datos correctos", async () => {
        const { result, onSuccess } = await setupHook();
        const evidenceFile = new File(["pdf"], "evidencia.pdf", {
            type: "application/pdf",
        });

        createAbsenceService.mockResolvedValueOnce({
            absenceId: "absence-with-file",
        });
        const form = fillAbsenceForm(result);
        act(() => {
            result.current.handleEvidenceChange({
                target: { files: [evidenceFile] },
            });
        });
        await submitForm(result);

        expect(createAbsenceService).toHaveBeenCalledWith("emp-1", {
            absenceTypeId: form.absenceTypeId,
            startDate: form.startDate,
            endDate: form.endDate,
            description: form.description,
            file: evidenceFile,
        });
        expect(onSuccess).toHaveBeenCalledWith({
            absenceId: "absence-with-file",
        });
    });
});
