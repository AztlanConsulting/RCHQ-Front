import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../utils/secureFetchWrapper", () => ({
    secureFetch: vi.fn(),
}));

import { secureFetch } from "../../utils/secureFetchWrapper";

describe("vacationService", () => {
    let getVacationEmployees;
    let getRemainingVacations;
    let registerEmployeeVacation;
    let requestEmployeeVacation;

    const loadService = async () => {
        vi.resetModules();

        vi.doMock("../../utils/secureFetchWrapper", () => ({
            secureFetch,
        }));

        ({
            getVacationEmployees,
            getRemainingVacations,
            registerEmployeeVacation,
            requestEmployeeVacation,
        } = await import("../../services/vacationService"));
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.stubEnv("VITE_API_URL", "http://api.test");

        await loadService();
    });

    const mockOk = (body) => ({
        ok: true,
        json: vi.fn().mockResolvedValue(body),
    });

    const mockFail = (body) => ({
        ok: false,
        json: vi.fn().mockResolvedValue(body),
    });

    it("getVacationEmployees llama al endpoint de empleados elegibles", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {
                    employees: [
                        {
                            employeeId: "emp-1",
                            name: "Ana López",
                        },
                    ],
                },
            }),
        );

        const result = await getVacationEmployees();

        expect(secureFetch).toHaveBeenCalledWith(
            "http://api.test/vacation/employees/eligible",
            {
                method: "GET",
            },
        );

        expect(result).toEqual([
            {
                employeeId: "emp-1",
                name: "Ana López",
            },
        ]);
    });

    it("getVacationEmployees regresa arreglo vacío si no hay empleados", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {},
            }),
        );

        const result = await getVacationEmployees();

        expect(result).toEqual([]);
    });

    it("getRemainingVacations llama al endpoint de días disponibles", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {
                    remainingVacations: 8,
                    startDate: "2026-01-01",
                    endDate: "2026-12-31",
                },
            }),
        );

        const result = await getRemainingVacations("emp-1");

        expect(secureFetch).toHaveBeenCalledWith(
            "http://api.test/vacation/remaining/emp-1",
            {
                method: "GET",
            },
        );

        expect(result).toEqual({
            remainingVacations: 8,
            startDate: "2026-01-01",
            endDate: "2026-12-31",
        });
    });

    it("getRemainingVacations usa valores por defecto si faltan datos", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {},
            }),
        );

        const result = await getRemainingVacations("emp-1");

        expect(result).toEqual({
            remainingVacations: 0,
            startDate: "",
            endDate: "",
        });
    });

    it("registerEmployeeVacation llama al endpoint correcto con POST", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {
                    vacationRequest: {
                        vacationRequestId: "vac-1",
                        employeeId: "emp-1",
                        status: 1,
                    },
                },
            }),
        );

        const result = await registerEmployeeVacation({
            employeeId: "emp-1",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
        });

        expect(secureFetch).toHaveBeenCalledWith(
            "http://api.test/vacation/employees/emp-1/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: "2026-05-05",
                    endDate: "2026-05-07",
                }),
            },
        );

        expect(result).toEqual({
            vacationRequestId: "vac-1",
            employeeId: "emp-1",
            status: 1,
        });
    });

    it("registerEmployeeVacation regresa null si no viene vacationRequest", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {},
            }),
        );

        const result = await registerEmployeeVacation({
            employeeId: "emp-1",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
        });

        expect(result).toBeNull();
    });

    it("requestEmployeeVacation llama al endpoint de solicitud del trabajador", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {
                    vacationRequest: {
                        vacationRequestId: "vac-request-1",
                        employeeId: "own-employee",
                        status: 0,
                    },
                },
            }),
        );

        const result = await requestEmployeeVacation({
            employeeId: "own-employee",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
        });

        expect(secureFetch).toHaveBeenCalledWith(
            "http://api.test/vacation/request",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: "2026-05-05",
                    endDate: "2026-05-07",
                }),
            },
        );

        expect(result).toEqual({
            vacationRequestId: "vac-request-1",
            employeeId: "own-employee",
            status: 0,
        });
    });

    it("requestEmployeeVacation regresa null si no viene vacationRequest", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: true,
                data: {},
            }),
        );

        const result = await requestEmployeeVacation({
            startDate: "2026-05-05",
            endDate: "2026-05-07",
        });

        expect(result).toBeNull();
    });

    it("requestEmployeeVacation lanza error si backend responde formato de fechas inválido", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message:
                    "Las fechas son requeridas y tienen que estar en formato YYYY-MM-DD",
            }),
        );

        await expect(
            requestEmployeeVacation({
                startDate: "2026-5-5",
                endDate: "2026-05-07",
            }),
        ).rejects.toThrow(
            "Las fechas son requeridas y tienen que estar en formato YYYY-MM-DD",
        );
    });

    it("requestEmployeeVacation lanza error si backend responde que faltan días de trabajo", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message: "Se necesitan tener registrados los días de trabajo",
            }),
        );

        await expect(
            requestEmployeeVacation({
                startDate: "2026-05-05",
                endDate: "2026-05-07",
            }),
        ).rejects.toThrow("Se necesitan tener registrados los días de trabajo");
    });

    it("requestEmployeeVacation lanza error si backend responde vacaciones fuera del periodo laboral", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message:
                    "No se pueden solicitar vacaciones fuera del periodo actual de trabajo",
            }),
        );

        await expect(
            requestEmployeeVacation({
                startDate: "2027-05-05",
                endDate: "2027-05-07",
            }),
        ).rejects.toThrow(
            "No se pueden solicitar vacaciones fuera del periodo actual de trabajo",
        );
    });

    it("requestEmployeeVacation lanza error si backend responde vacaciones pasadas o del mismo día", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message:
                    "No se pueden pedir vacaciones en el pasado ni para el mismo día",
            }),
        );

        await expect(
            requestEmployeeVacation({
                startDate: "2026-01-01",
                endDate: "2026-01-02",
            }),
        ).rejects.toThrow(
            "No se pueden pedir vacaciones en el pasado ni para el mismo día",
        );
    });

    it("requestEmployeeVacation lanza error si backend responde que no hay días hábiles", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message:
                    "Dentro del rango seleccionado no hay ningún día hábil de vacaciones",
            }),
        );

        await expect(
            requestEmployeeVacation({
                startDate: "2026-05-10",
                endDate: "2026-05-11",
            }),
        ).rejects.toThrow(
            "Dentro del rango seleccionado no hay ningún día hábil de vacaciones",
        );
    });

    it("requestEmployeeVacation lanza error si backend responde días insuficientes", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message:
                    "No se tienen suficientes días disponibles para solicitar las vacaciones",
            }),
        );

        await expect(
            requestEmployeeVacation({
                startDate: "2026-05-05",
                endDate: "2026-05-20",
            }),
        ).rejects.toThrow(
            "No se tienen suficientes días disponibles para solicitar las vacaciones",
        );
    });

    it("requestEmployeeVacation lanza error si backend responde que ya existe una solicitud en el rango", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message:
                    "Ya hay una solicitud de vacaciones cubriendo los días solicitados",
            }),
        );

        await expect(
            requestEmployeeVacation({
                startDate: "2026-07-01",
                endDate: "2026-07-03",
            }),
        ).rejects.toThrow(
            "Ya hay una solicitud de vacaciones cubriendo los días solicitados",
        );
    });

    it("lanza error con mensaje de validación si backend responde errors", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                errors: [
                    {
                        message: "No hay días suficientes",
                    },
                ],
            }),
        );

        await expect(
            registerEmployeeVacation({
                employeeId: "emp-1",
                startDate: "2026-05-05",
                endDate: "2026-05-20",
            }),
        ).rejects.toThrow("No hay días suficientes");
    });

    it("lanza error con message si backend responde message", async () => {
        secureFetch.mockResolvedValue(
            mockFail({
                message: "Empleado no encontrado",
            }),
        );

        await expect(getRemainingVacations("emp-x")).rejects.toThrow(
            "Empleado no encontrado",
        );
    });

    it("lanza error si success es false", async () => {
        secureFetch.mockResolvedValue(
            mockOk({
                success: false,
                message: "Error en vacaciones",
            }),
        );

        await expect(getVacationEmployees()).rejects.toThrow(
            "Error en vacaciones",
        );
    });

    it("lanza error genérico si no hay mensaje específico", async () => {
        secureFetch.mockResolvedValue(mockFail({}));

        await expect(getVacationEmployees()).rejects.toThrow(
            "No se pudo completar la operación de vacaciones",
        );
    });
});
