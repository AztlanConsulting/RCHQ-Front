import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import useBeneficiaryCreateForm from "../../hooks/pages/useBeneficiaryCreateForm";
import { createBeneficiary } from "../../services/beneficiaryService";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../../services/beneficiaryService", () => ({
    createBeneficiary: vi.fn(),
}));

const wrapper = ({ children }) =>
    createElement(MemoryRouter, null, children);

const validForm = {
    name: "Juan Manuel",
    maternal_surname: "Lopez",
    paternal_surname: "Garcia",
    preferred_name: "Juanito",
    birth_date: "2015-03-10",
    age_entered_house: "8",
    blood_type: "O+",
    curp: "",
};

const fillForm = (result) => {
    for (const [name, value] of Object.entries(validForm)) {
        act(() => {
            result.current.handleChange({
                target: { name, value },
            });
        });
    }
};

describe("useBeneficiaryCreateForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("capitaliza nombres al escribir", () => {
        const { result } = renderHook(() => useBeneficiaryCreateForm(), {
            wrapper,
        });

        act(() => {
            result.current.handleChange({
                target: { name: "name", value: "juan manuel" },
            });
        });

        expect(result.current.form.name).toBe("Juan Manuel");

        act(() => {
            result.current.handleChange({
                target: { name: "paternal_surname", value: "garcia" },
            });
        });

        expect(result.current.form.paternal_surname).toBe("Garcia");
    });

    it("inicializa el formulario vacío", () => {
        const { result } = renderHook(() => useBeneficiaryCreateForm(), {
            wrapper,
        });

        expect(result.current.form).toEqual({
            name: "",
            maternal_surname: "",
            paternal_surname: "",
            preferred_name: "",
            birth_date: "",
            age_entered_house: "",
            blood_type: "",
            curp: "",
        });
        expect(result.current.errors).toEqual({});
        expect(result.current.isLoading).toBe(false);
    });

    it("no llama al servicio si la validación falla", async () => {
        const { result } = renderHook(() => useBeneficiaryCreateForm(), {
            wrapper,
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(createBeneficiary).not.toHaveBeenCalled();
        expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
        expect(result.current.serverError).toBeTruthy();
    });

    it("muestra éxito sin redirigir", async () => {
        const onSuccess = vi.fn();
        createBeneficiary.mockResolvedValueOnce({
            message: "Beneficiario registrado con éxito.",
        });

        const { result } = renderHook(
            () => useBeneficiaryCreateForm(onSuccess),
            { wrapper },
        );

        fillForm(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(createBeneficiary).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(result.current.serverSuccess).toBe(
            "Beneficiario registrado con éxito.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(result.current.form.name).toBe("");
        expect(result.current.conflictModal.show).toBe(false);
    });

    it("abre el modal de conflicto cuando el beneficiario ya existe", async () => {
        const conflictError = new Error(
            "Beneficiario con la misma información ya se encuentra en esta casa",
        );
        conflictError.status = 406;
        conflictError.isAlreadyRegistered = true;
        createBeneficiary.mockRejectedValueOnce(conflictError);

        const { result } = renderHook(() => useBeneficiaryCreateForm(), {
            wrapper,
        });

        fillForm(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.conflictModal).toEqual({
            show: true,
            message:
                "Beneficiario con la misma información ya se encuentra en esta casa",
        });
        expect(result.current.serverError).toBeNull();
    });

    it("muestra error del servidor y fieldErrors del backend", async () => {
        const apiError = new Error("Conflicto de registro");
        apiError.fieldErrors = { curp: "CURP ya registrado" };
        createBeneficiary.mockRejectedValueOnce(apiError);

        const { result } = renderHook(() => useBeneficiaryCreateForm(), {
            wrapper,
        });

        fillForm(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        await waitFor(() => {
            expect(result.current.serverError).toBe("Conflicto de registro");
        });
        expect(result.current.errors.curp).toBe("CURP ya registrado");
        expect(result.current.isLoading).toBe(false);
    });
});
