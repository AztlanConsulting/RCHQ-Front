import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AltaBeneficiario from "../../pages/beneficiaries/altaBeneficiario";

const mockNavigate = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/beneficiaryService", () => ({
    createBeneficiary: vi.fn(),
}));

vi.mock("../../components/atoms/dateField", () => ({
    default: ({ label, name, value, onChange }) => (
        <div>
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                name={name}
                type="date"
                value={value ?? ""}
                onChange={onChange}
            />
        </div>
    ),
}));

import { createBeneficiary } from "../../services/beneficiaryService";

const validFormData = {
    name: "Juan Manuel",
    preferred_name: "Juanito",
    paternal_surname: "Garcia",
    maternal_surname: "Lopez",
    birth_date: "2015-03-10",
    age_entered_house: "8",
    blood_type: "O+",
    curp: "",
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <AltaBeneficiario onSuccess={mockOnSuccess} />
        </MemoryRouter>,
    );

const fillAndSubmit = async (data) => {
    for (const [key, value] of Object.entries(data)) {
        if (key === "blood_type") {
            const select = document.querySelector(`select[name="${key}"]`);
            if (select) {
                fireEvent.change(select, {
                    target: { name: key, value },
                });
            }
        } else {
            const input =
                document.getElementById(key) ||
                document.querySelector(`input[name="${key}"]`);

            if (input) {
                fireEvent.change(input, {
                    target: { name: key, value },
                });
            }
        }
    }

    const submitBtn = screen.getByRole("button", { name: /registrar/i });

    await act(async () => {
        fireEvent.click(submitBtn);
    });
};

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("AltaBeneficiario — integración de formulario y servicios", () => {
    it("renderiza el título y la sección del formulario", () => {
        renderPage();

        expect(
            screen.getByRole("heading", { name: /registrar beneficiario/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/información del beneficiario/i),
        ).toBeInTheDocument();
    });

    it("muestra errores de validación si el formulario está vacío", async () => {
        renderPage();

        const submitBtn = screen.getByRole("button", { name: /registrar/i });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        await waitFor(() => {
            expect(createBeneficiary).not.toHaveBeenCalled();
            expect(
                screen.getAllByText(/es obligatorio/i).length,
            ).toBeGreaterThan(0);
        });
    });

    it("registra al beneficiario exitosamente", async () => {
        createBeneficiary.mockResolvedValueOnce({
            redirect: "/app/beneficiarios/ver/ben-1",
        });

        renderPage();
        await fillAndSubmit(validFormData);

        await waitFor(() => {
            expect(createBeneficiary).toHaveBeenCalledTimes(1);
        });
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(
            "/app/beneficiarios/ver/ben-1",
        );
    });

    it("muestra error si el backend falla", async () => {
        createBeneficiary.mockRejectedValueOnce(
            new Error("El beneficiario ya está registrado en otra casa"),
        );

        renderPage();
        await fillAndSubmit(validFormData);

        await waitFor(() => {
            expect(createBeneficiary).toHaveBeenCalledTimes(1);
        });
        expect(
            screen.getByText(
                "El beneficiario ya está registrado en otra casa",
            ),
        ).toBeInTheDocument();
    });

    it("vuelve a la lista al pulsar cancelar", async () => {
        renderPage();

        const cancelBtn = screen.getByRole("button", { name: /cancelar/i });
        await act(async () => {
            fireEvent.click(cancelBtn);
        });

        expect(mockNavigate).toHaveBeenCalledWith("/app/beneficiarios");
    });
});
