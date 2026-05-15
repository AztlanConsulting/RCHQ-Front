import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
    within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Documents from "../../pages/documents";

// ─── Mocks ────────────────────────────────────────────────
vi.mock("../../services/documentService", () => ({
    getDocumentsService: vi.fn(),
    uploadDocumentService: vi.fn(),
    updateDocumentService: vi.fn(),
    deleteDocumentService: vi.fn(),
    getDocumentTypesService: vi.fn(() =>
        Promise.resolve([
            { value: "cv", label: "CV" },
            { value: "nss", label: "NSS" },
        ]),
    ),
    DOCUMENT_TYPES: [
        { value: "cv", label: "CV" },
        { value: "nss", label: "NSS" },
    ],
}));

import {
    getDocumentsService,
    uploadDocumentService,
    updateDocumentService,
    deleteDocumentService,
    getDocumentTypesService,
} from "../../services/documentService";

// ─── Helpers ──────────────────────────────────────────────
const makeToken = (role = "Admin") => {
    const payload = btoa(JSON.stringify({ id: "emp-123", role }));
    return `header.${payload}.signature`;
};

const TEST_EMPLOYEE_ID = "emp-123";

const renderPage = (role = "Admin") => {
    localStorage.setItem("token", makeToken(role));
    return render(
        <MemoryRouter
            initialEntries={[`/employee/${TEST_EMPLOYEE_ID}/documents`]}
        >
            <Routes>
                <Route
                    path="/employee/:employeeId/documents"
                    element={<Documents />}
                />
            </Routes>
        </MemoryRouter>,
    );
};

// ─── Respuestas mock ──────────────────────────────────────
const mockDocumentsResponse = {
    success: true,
    data: [{ documentId: "cv", name: "CV", url: "uploads/documents/cv.pdf" }],
};

const mockDocumentsMultiple = {
    success: true,
    data: [
        { documentId: "cv", name: "CV", url: "uploads/documents/cv.pdf" },
        { documentId: "nss", name: "NSS", url: null },
    ],
};

const mockEmptyResponse = {
    success: true,
    message: "El empleado no tiene documentos",
    body: null,
};

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getDocumentsService.mockResolvedValue({
        success: true,
        body: { documents: {} },
    });
    getDocumentTypesService.mockResolvedValue([
        { value: "cv", label: "CV" },
        { value: "nss", label: "NSS" },
    ]);
});

// ══════════════════════════════════════════════════════════════════════════════
// Carga inicial
// ══════════════════════════════════════════════════════════════════════════════

describe("Documents — carga inicial", () => {
    it("muestra los documentos del empleado cuando la carga es exitosa", async () => {
        getDocumentsService.mockResolvedValue(mockDocumentsMultiple);
        renderPage();
        await waitFor(() => {
            expect(screen.getByText("CV")).toBeInTheDocument();
        });
        expect(getDocumentsService).toHaveBeenCalledWith(TEST_EMPLOYEE_ID);
    });

    it("muestra mensaje vacío cuando el empleado no tiene documentos", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        renderPage();
        await waitFor(() => {
            expect(
                screen.getByText(/aún no tiene documentos/i),
            ).toBeInTheDocument();
        });
    });

    it("muestra el error cuando el servicio falla", async () => {
        getDocumentsService.mockRejectedValue(new Error("Error de red"));
        renderPage();
        await waitFor(() => {
            expect(screen.getByText(/error de red/i)).toBeInTheDocument();
        });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Permisos por rol
// ══════════════════════════════════════════════════════════════════════════════

describe("Documents — permisos por rol", () => {
    it("muestra el botón 'Subir documento' cuando el rol es Administrador", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        renderPage("Admin");
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /subir documento/i }),
            ).toBeInTheDocument();
        });
    });

    it("muestra el botón 'Subir documento' cuando el rol es Coordinador", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        renderPage("Coordinador");
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /subir documento/i }),
            ).toBeInTheDocument();
        });
    });

    it("oculta el botón 'Subir documento' cuando el rol es empleado", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        renderPage("Empleado");
        await waitFor(() => {
            expect(
                screen.queryByRole("button", { name: /subir documento/i }),
            ).toBeNull();
        });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Subir documento
// ══════════════════════════════════════════════════════════════════════════════

describe("Documents — subir documento", () => {
    it("abre el modal al hacer click en 'Subir documento'", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /subir documento/i }),
            ).toBeInTheDocument(),
        );
        fireEvent.click(
            screen.getByRole("button", { name: /subir documento/i }),
        );
        expect(screen.getByText("Subir documento")).toBeInTheDocument();
        expect(screen.getByText(/selecciona un tipo/i)).toBeInTheDocument();
    });

    it("cierra el modal al hacer click en Cancelar", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /subir documento/i }),
            ).toBeInTheDocument(),
        );
        fireEvent.click(
            screen.getByRole("button", { name: /subir documento/i }),
        );
        expect(screen.getByText("Subir documento")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
        await waitFor(() => {
            expect(screen.queryByText("Subir documento")).toBeNull();
        });
    });

    it("muestra error de validación si se intenta subir sin seleccionar tipo", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /subir documento/i }),
            ).toBeInTheDocument(),
        );
        fireEvent.click(
            screen.getByRole("button", { name: /subir documento/i }),
        );
        fireEvent.click(screen.getByRole("button", { name: /^subir$/i }));
        await waitFor(() => {
            expect(
                screen.getByText(/selecciona el tipo de documento/i),
            ).toBeInTheDocument();
        });
        expect(uploadDocumentService).not.toHaveBeenCalled();
    });

    it("sube el documento exitosamente y recarga la lista", async () => {
        getDocumentsService.mockResolvedValue(mockEmptyResponse);
        uploadDocumentService.mockResolvedValue({ success: true });
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /subir documento/i }),
            ).toBeInTheDocument(),
        );
        fireEvent.click(
            screen.getByRole("button", { name: /subir documento/i }),
        );
        const select = document.querySelector("select");
        fireEvent.change(select, { target: { value: "cv" } });
        const file = new File(["contenido"], "cv.pdf", {
            type: "application/pdf",
        });
        const fileInput = document.querySelector("input[type='file']");
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /^subir$/i }));
        });
        await waitFor(() => {
            expect(uploadDocumentService).toHaveBeenCalledWith(
                TEST_EMPLOYEE_ID,
                expect.any(FormData),
            );
        });
        await waitFor(() => {
            expect(getDocumentsService).toHaveBeenCalledTimes(2);
        });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Editar documento
// ══════════════════════════════════════════════════════════════════════════════

describe("Documents — editar documento", () => {
    it("abre el modal en modo edición al hacer click en el botón editar", async () => {
        getDocumentsService.mockResolvedValue(mockDocumentsResponse);
        renderPage();
        await waitFor(() => {
            expect(screen.getByText("CV")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTitle("Editar"));
        expect(screen.getByText("Editar documento")).toBeInTheDocument();
        expect(screen.getByText(/guardar cambios/i)).toBeInTheDocument();
    });

    it("actualiza el documento y recarga la lista", async () => {
        getDocumentsService.mockResolvedValue(mockDocumentsResponse);
        updateDocumentService.mockResolvedValue({ success: true });
        renderPage();
        await waitFor(() => {
            expect(screen.getByText("CV")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTitle("Editar"));
        await waitFor(() =>
            expect(screen.getByText("Editar documento")).toBeInTheDocument(),
        );
        const file = new File(["nuevo"], "cv_nuevo.pdf", {
            type: "application/pdf",
        });
        const fileInput = document.querySelector("input[type='file']");
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });
        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", { name: /guardar cambios/i }),
            );
        });
        await waitFor(() => {
            expect(updateDocumentService).toHaveBeenCalledWith(
                TEST_EMPLOYEE_ID,
                "cv",
                expect.any(FormData),
            );
        });
        await waitFor(() => {
            expect(getDocumentsService).toHaveBeenCalledTimes(2);
        });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Eliminar documento
// ══════════════════════════════════════════════════════════════════════════════
describe("Documents — eliminar documento", () => {
    const getConfirmButton = () => {
        const modal = screen
            .getByText(/esta acción no se puede revertir/i)
            .closest("div");
        return within(modal).getByRole("button", { name: /^eliminar$/i });
    };

    const clickFirstDelete = () => {
        const deleteButtons = screen.getAllByTitle("Eliminar");
        fireEvent.click(deleteButtons[0]);
    };

    it("abre el modal de confirmación al hacer click en eliminar", async () => {
        getDocumentsService.mockResolvedValue(mockDocumentsMultiple);
        renderPage();
        await waitFor(() => {
            expect(screen.getByText("CV")).toBeInTheDocument();
        });
        clickFirstDelete();
        expect(screen.getByText(/eliminar documento/i)).toBeInTheDocument();
        expect(
            screen.getByText(/esta acción no se puede revertir/i),
        ).toBeInTheDocument();
    });

    it("cancela la eliminación al hacer click en Cancelar del modal", async () => {
        getDocumentsService.mockResolvedValue(mockDocumentsMultiple);
        renderPage();
        await waitFor(() => {
            expect(screen.getByText("CV")).toBeInTheDocument();
        });
        clickFirstDelete();
        expect(screen.getByText(/eliminar documento/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
        await waitFor(() => {
            expect(
                screen.queryByText(/esta acción no se puede revertir/i),
            ).toBeNull();
        });
        expect(deleteDocumentService).not.toHaveBeenCalled();
    });

    it("elimina el documento y lo quita de la lista al confirmar", async () => {
        getDocumentsService.mockResolvedValue(mockDocumentsResponse);
        deleteDocumentService.mockResolvedValue({ success: true });
        renderPage();
        await waitFor(() => {
            expect(screen.getByText("CV")).toBeInTheDocument();
        });
        // Un solo documento → getByTitle no falla
        fireEvent.click(screen.getByTitle("Eliminar"));
        await waitFor(() =>
            expect(screen.getByText(/eliminar documento/i)).toBeInTheDocument(),
        );
        await act(async () => {
            fireEvent.click(getConfirmButton());
        });
        await waitFor(() => {
            expect(deleteDocumentService).toHaveBeenCalledWith(
                TEST_EMPLOYEE_ID,
                "cv",
            );
        });
        await waitFor(() => {
            expect(screen.queryByText("CV")).toBeNull();
        });
    });

    it("muestra error si la eliminación falla", async () => {
        getDocumentsService.mockResolvedValue(mockDocumentsResponse);
        deleteDocumentService.mockRejectedValue(new Error("Error al eliminar"));
        renderPage();
        await waitFor(() => {
            expect(screen.getByText("CV")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTitle("Eliminar"));
        await waitFor(() =>
            expect(
                screen.getByText(/esta acción no se puede revertir/i),
            ).toBeInTheDocument(),
        );
        await act(async () => {
            fireEvent.click(getConfirmButton());
        });
        await waitFor(() => {
            expect(screen.getByText(/error al eliminar/i)).toBeInTheDocument();
        });
    });
});
