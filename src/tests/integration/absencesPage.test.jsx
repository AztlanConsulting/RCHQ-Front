import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import AbsencesPage from "../../pages/absences";
import { useAbsences } from "../../hooks/organism/useAbsences";
import { useHouses }   from "../../hooks/organism/useHouses";

vi.mock("../../hooks/organism/useAbsences", () => ({ useAbsences: vi.fn() }));
vi.mock("../../hooks/organism/useHouses",   () => ({ useHouses:   vi.fn() }));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const BASE_ABSENCE = {
  absenceId: "ab-1",
  start: "2026-05-03",
  end:   "2026-05-07",
  url:   null,
  absenceType: "Médica",
  employee: { name: "Carlos Ramírez", picture: null, house: "Desarrollo" },
};

const defaultHookData = {
  absences: [BASE_ABSENCE],
  loading: false,
  error: null,
  page: 1,
  totalPages: 2,
  total: 10,
  goNextPage: vi.fn(),
  goPrevPage: vi.fn(),
  searchName:     "",  setSearchName:     vi.fn(),
  filterEvidence: "",  setFilterEvidence: vi.fn(),
  filterHouseId:  "",  setFilterHouseId:  vi.fn(),
  filterStart:    "",  setFilterStart:    vi.fn(),
  filterEnd:      "",  setFilterEnd:      vi.fn(),
  filterDeleted:  "false", setFilterDeleted: vi.fn(),
  clearFilters:   vi.fn(),
};

const defaultHousesData = {
  houseOptions: [
    { value: "h-1", label: "Desarrollo" },
    { value: "h-2", label: "Casa Hogar A" },
  ],
  loading: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  useAbsences.mockReturnValue(defaultHookData);
  useHouses.mockReturnValue(defaultHousesData);
});

const renderPage = () =>
  render(
    <BrowserRouter>
      <AbsencesPage />
    </BrowserRouter>,
  );

// ── Renderizado general ────────────────────────────────────────────────────

describe("AbsencesPage — renderizado general", () => {
  it("muestra el título de la página", () => {
    renderPage();
    expect(screen.getByText("Ausencias de todas las casas")).toBeInTheDocument();
  });

  it("muestra el botón 'Mis ausencias'", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /mis ausencias/i }),
    ).toBeInTheDocument();
  });

  it("navega a /app/ausencias/mis-ausencias al hacer click", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /mis ausencias/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/app/ausencias/mis-ausencias");
  });

  it("muestra las cabeceras de la tabla de ausencias", () => {
    renderPage();
    [
      "Foto", "Nombre completo", "Casa hogar",
      "Día de inicio", "Día de término",
      "Evidencia", "Tipo de ausencia", "Acciones",
    ].forEach((col) => expect(screen.getByText(col)).toBeInTheDocument());
  });
});

// ── Datos en tabla ─────────────────────────────────────────────────────────

describe("AbsencesPage — datos en tabla", () => {
  it("muestra el nombre del empleado de la ausencia", () => {
    renderPage();
    expect(screen.getByText("Carlos Ramírez")).toBeInTheDocument();
  });

  it("muestra la casa hogar del empleado", () => {
    renderPage();
    // getAllByText devuelve todos; verificamos que al menos uno sea un párrafo
    const matches = screen.getAllByText("Desarrollo");
    const inTable = matches.some((el) => el.tagName === "P");
    expect(inTable).toBe(true);
  });

  it("muestra las fechas formateadas dd/mm/yyyy", () => {
    renderPage();
    expect(screen.getByText("03/05/2026")).toBeInTheDocument();
    expect(screen.getByText("07/05/2026")).toBeInTheDocument();
  });

  it("muestra 'No tiene evidencia' cuando url es null", () => {
    renderPage();
    expect(screen.getByText("No tiene evidencia")).toBeInTheDocument();
  });

  it("muestra el enlace PDF cuando url tiene valor", () => {
    useAbsences.mockReturnValue({
      ...defaultHookData,
      absences: [{ ...BASE_ABSENCE, url: "uploads/evidencia.pdf" }],
    });
    renderPage();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("muestra el tipo de ausencia", () => {
    renderPage();
    expect(screen.getByText("Médica")).toBeInTheDocument();
  });
});

// ── Estados de carga y error ───────────────────────────────────────────────

describe("AbsencesPage — estados de la tabla", () => {
  it("muestra el mensaje de carga mientras loading es true", () => {
    useAbsences.mockReturnValue({
      ...defaultHookData,
      loading: true,
      absences: [],
    });
    renderPage();
    expect(screen.getByText("Cargando ausencias...")).toBeInTheDocument();
  });

  it("muestra el error si existe", () => {
    useAbsences.mockReturnValue({
      ...defaultHookData,
      error: "Error de conexión",
      absences: [],
    });
    renderPage();
    expect(screen.getByText("Error: Error de conexión")).toBeInTheDocument();
  });

  it("muestra mensaje vacío si no hay ausencias", () => {
    useAbsences.mockReturnValue({ ...defaultHookData, absences: [] });
    renderPage();
    expect(screen.getByText("No hay ausencias registradas")).toBeInTheDocument();
  });

  it("no muestra la paginación mientras carga", () => {
    useAbsences.mockReturnValue({
      ...defaultHookData,
      loading: true,
      absences: [],
    });
    renderPage();
    expect(screen.queryByRole("button", { name: /siguiente/i })).not.toBeInTheDocument();
  });
});

// ── Filtros ────────────────────────────────────────────────────────────────

describe("AbsencesPage — filtros", () => {
  it("muestra el campo de búsqueda por nombre", () => {
    renderPage();
    expect(
      screen.getByPlaceholderText("Nombre del empleado"),
    ).toBeInTheDocument();
  });

  it("muestra el select de casa hogar con opciones del hook useHouses", () => {
    renderPage();
    expect(screen.getByText("Casa Hogar A")).toBeInTheDocument();
  });

  it("muestra 'Cargando casas...' si useHouses está cargando", () => {
    useHouses.mockReturnValue({ houseOptions: [], loading: true });
    renderPage();
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("llama a clearFilters al hacer click en 'Limpiar filtros'", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(defaultHookData.clearFilters).toHaveBeenCalledTimes(1);
  });

  it("llama a setFilterEvidence al cambiar el select de evidencia", () => {
    renderPage();
    const selects = screen.getAllByRole("combobox");
    const evidenceSelect = selects[2];
    fireEvent.change(evidenceSelect, { target: { value: "con" } });
    expect(defaultHookData.setFilterEvidence).toHaveBeenCalledWith("con");
  });

  it("llama a setFilterStart al cambiar la fecha de inicio", () => {
    renderPage();
    const dateInputs = screen
      .getAllByRole("textbox", { hidden: true })
      .filter((el) => el.type === "date");
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0], { target: { value: "2026-01-01" } });
      expect(defaultHookData.setFilterStart).toHaveBeenCalledWith("2026-01-01");
    }
  });
});

// ── Paginación ─────────────────────────────────────────────────────────────

describe("AbsencesPage — paginación", () => {
  it("muestra el texto de paginación correcto", () => {
    renderPage();
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByText(/total: 10 ausencias/i)).toBeInTheDocument();
  });

  it("llama a goNextPage al hacer click en Siguiente", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(defaultHookData.goNextPage).toHaveBeenCalledTimes(1);
  });

  it("deshabilita Anterior en la primera página", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /anterior/i }),
    ).toBeDisabled();
  });

  it("deshabilita Siguiente en la última página", () => {
    useAbsences.mockReturnValue({ ...defaultHookData, page: 2, totalPages: 2 });
    renderPage();
    expect(
      screen.getByRole("button", { name: /siguiente/i }),
    ).toBeDisabled();
  });
});