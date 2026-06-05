import { act, renderHook, waitFor } from "@testing-library/react";
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

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

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

    it("registra al beneficiario y navega al redirect", async () => {
        const onSuccess = vi.fn();
        createBeneficiary.mockResolvedValueOnce({
            redirect: "/app/beneficiarios/ver/ben-99",
        });

        const { result } = renderHook(
            () => useBeneficiaryCreateForm(onSuccess),
            { wrapper },
        );

        fillForm(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        await waitFor(() => {
            expect(createBeneficiary).toHaveBeenCalledTimes(1);
        });
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(
            "/app/beneficiarios/ver/ben-99",
        );
        expect(result.current.form.name).toBe("");
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
