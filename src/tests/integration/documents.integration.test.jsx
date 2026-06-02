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

vi.mock("../../services/documentService", () => ({
  getDocumentsService:     vi.fn(),
  uploadDocumentService:   vi.fn(),
  updateDocumentService:   vi.fn(),
  deleteDocumentService:   vi.fn(),
  getDocumentTypesService: vi.fn(() => Promise.resolve([
    { value: "cv",  label: "CV" },
      { value: "nss", label: "NSS" },
  ])),
  DOCUMENT_TYPES: [
    { value: "cv",  label: "CV" },
    { value: "nss", label: "NSS" },
  ],
}));

vi.mock("../../services/trainingService", () => ({
  getTrainingsService: vi.fn(),
}));

import {
  getDocumentsService,
  uploadDocumentService,
  updateDocumentService,
  deleteDocumentService,
  getDocumentTypesService,
} from "../../services/documentService";
import { getTrainingsService } from "../../services/trainingService";

// ─── Helpers ──────────────────────────────────────────────
const makeToken = (role = "Coordinador") => {
  const payload = btoa(JSON.stringify({ id: "emp-123", role }));
  return `header.${payload}.signature`;
};

const TEST_EMPLOYEE_ID = "emp-123";

const renderPage = (role = "Coordinador") => {
  localStorage.setItem("token", makeToken(role));
  localStorage.setItem(
    "user",
    JSON.stringify({ role, employeeId: TEST_EMPLOYEE_ID }),
  );

  return render(
    <MemoryRouter initialEntries={[`/employee/${TEST_EMPLOYEE_ID}/documents`]}>
      <Routes>
        <Route path="/employee/:employeeId/documents" element={<Documents />} />
      </Routes>
    </MemoryRouter>,
  );
};

const mockDocumentsResponse = {
  success: true,
  data: [
    { documentId: "cv", name: "CV", url: "uploads/documents/cv.pdf" },
  ],
};

const mockDocumentsMultiple = {
  success: true,
  data: [
    { documentId: "cv",  name: "CV",  url: "uploads/documents/cv.pdf" },
    { documentId: "nss", name: "NSS", url: null },
  ],
};

const mockEmptyResponse = {
  success: true,
  message: "El empleado no tiene documentos",
  body:    null,
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
  peopleInsideEvent: [
    { id: "emp-1", name: "Manuel Bajos Rivera" },
    { id: "emp-2", name: "Santiago Jimenez Palazuelos" },
    { id: "emp-3", name: "Ernesto Villafranco Ozuna" },
    { id: "emp-4", name: "Emilio Santiago Lopez Quinonez" },
  ],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  getDocumentsService.mockResolvedValue({ success: true, data: [] });
  getTrainingsService.mockResolvedValue({ success: true, data: [] });
  getDocumentTypesService.mockResolvedValue([
    { value: "cv",  label: "CV" },
    { value: "nss", label: "NSS" },
  ]);
});


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
      expect(screen.getByText(/aún no tiene documentos/i)).toBeInTheDocument();
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


describe("Documents — permisos por rol", () => {
  it("no muestra el botón Subir cuando el rol es Administrador (canModify Coordinador sólo)", async () => {
    getDocumentsService.mockResolvedValue(mockEmptyResponse);
    renderPage("Administrador");
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /subir documento/i }),
      ).toBeNull();
    });
  });

  it("muestra el botón Subir cuando el rol es Coordinador", async () => {
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


describe("Documents — subir documento", () => {
  it("abre el modal al hacer click en 'Subir documento'", async () => {
    getDocumentsService.mockResolvedValue(mockEmptyResponse);
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /subir documento/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /subir documento/i }));
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
    fireEvent.click(screen.getByRole("button", { name: /subir documento/i }));
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
    fireEvent.click(screen.getByRole("button", { name: /subir documento/i }));
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
    fireEvent.click(screen.getByRole("button", { name: /subir documento/i }));
    const select = document.querySelector("select");
    fireEvent.change(select, { target: { value: "cv" } });
    const file      = new File(["contenido"], "cv.pdf", { type: "application/pdf" });
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
    const file      = new File(["nuevo"], "cv_nuevo.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("input[type='file']");
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));
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

describe("Documents — eliminar documento", () => {
  const getConfirmButton = () => {
    const modal = screen.getByRole("dialog", { name: /eliminar documento/i });
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
      screen.getByText(/no se puede revertir/i),
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
        screen.getByText(/no se puede revertir/i),
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

describe("Documents - capacitaciones del trabajador", () => {
  it("muestra solo las capacitaciones que regresa el servicio para el trabajador", async () => {
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

    renderPage("Cuidador");

    await waitFor(() => {
      expect(screen.getByText("Capacitacion del DIF")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Capacitacion de seguridad"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Capacitacion fuera de la casa"),
    ).not.toBeInTheDocument();
    expect(getTrainingsService).toHaveBeenCalledWith(TEST_EMPLOYEE_ID);
  });

  it("muestra mensaje vacio cuando el trabajador no tiene capacitaciones", async () => {
    renderPage("Cuidador");

    await waitFor(() => {
      expect(
        screen.getByText(
          /este empleado a[uú]n no tiene capacitaciones registradas/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it("abre el detalle sin botones de accion y muestra a todos los empleados ligados", async () => {
    getTrainingsService.mockResolvedValue({
      success: true,
      data: [buildTraining()],
    });

    renderPage("Cuidador");

    const trainingCard = await screen.findByRole("button", {
      name: /capacitacion del dif/i,
    });
    fireEvent.click(trainingCard);

    await waitFor(() => {
      expect(screen.getByText("Detalle del evento")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Empleados ligados al evento:"),
    ).toBeInTheDocument();
    expect(screen.getByText("Manuel Bajos Rivera")).toBeInTheDocument();
    expect(
      screen.getByText("Santiago Jimenez Palazuelos"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ernesto Villafranco Ozuna"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Emilio Santiago Lopez Quinonez").length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: /editar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /eliminar/i }),
    ).not.toBeInTheDocument();
  });

  it("renderiza todas las capacitaciones cuando hay muchas registradas", async () => {
    const manyTrainings = Array.from({ length: 8 }, (_, index) =>
      buildTraining({
        eventId: `training-${index + 1}`,
        title: `Capacitacion ${index + 1}`,
      }),
    );

    getTrainingsService.mockResolvedValue({
      success: true,
      data: manyTrainings,
    });

    renderPage("Cuidador");

    await waitFor(() => {
      expect(screen.getByText("Capacitacion 1")).toBeInTheDocument();
    });

    for (const training of manyTrainings) {
      expect(screen.getByText(training.title)).toBeInTheDocument();
    }
  });
});
