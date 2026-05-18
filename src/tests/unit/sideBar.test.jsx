// src/tests/unit/sideBar.test.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SideBar from "../../components/organism/sideBar";
import useAuth from "../../hooks/useAuth";
import useSideBar from "../../hooks/organism/useSideBar";

vi.mock("../../hooks/useAuth", () => ({
  default: vi.fn(),
}));

vi.mock("../../hooks/organism/useSideBar", () => ({
  default: vi.fn(),
}));

const defaultSideBarState = {
  expanded: false,
  toggle: vi.fn(),
  mobileOpen: false,
  openMobile: vi.fn(),
  closeMobile: vi.fn(),
};

const defaultAuthState = {
  user: null,
  logout: vi.fn(),
};

const renderSideBar = () =>
  render(
    <MemoryRouter>
      <SideBar />
    </MemoryRouter>,
  );

const setupSideBar = ({
  expanded = false,
  mobileOpen = false,
  user = null,
} = {}) => {
  useSideBar.mockReturnValue({
    ...defaultSideBarState,
    expanded,
    mobileOpen,
  });

  useAuth.mockReturnValue({
    ...defaultAuthState,
    user,
  });
};

describe("SideBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSideBar();
  });

  it("renderiza el título TOCHAN", () => {
    renderSideBar();

    expect(screen.getAllByText("TOCHAN").length).toBeGreaterThan(0);
  });

  it("renderiza todos los nav items", () => {
    renderSideBar();

    const labels = [
      "Calendario",
      "Personal",
      "Casas Hogares",
      "Vacaciones",
      "Ausencias",
      "Donaciones",
    ];

    labels.forEach((label) => {
      expect(
        screen.getAllByRole("link", { name: label }).length,
      ).toBeGreaterThan(0);
    });
  });

  it("renderiza Perfil y Cerrar Sesión", () => {
    renderSideBar();

    expect(
      screen.getAllByRole("link", { name: "Perfil" }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("button", { name: "Cerrar Sesión" }).length,
    ).toBeGreaterThan(0);
  });

  it("el botón expandir tiene aria-label correcto cuando está colapsado", () => {
    renderSideBar();

    expect(
      screen.getByRole("button", { name: "Expandir menú" }),
    ).toBeInTheDocument();
  });

  it("el botón hamburguesa mobile tiene aria-label correcto", () => {
    renderSideBar();

    expect(
      screen.getByRole("button", { name: "Abrir menú" }),
    ).toBeInTheDocument();
  });

  it("muestra Registros para Coordinador", () => {
    setupSideBar({ user: { role: { name: "Coordinador" } } });
    renderSideBar();

    expect(
      screen.getAllByRole("link", { name: "Acciones registradas" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Acciones registradas" })[0]).toHaveAttribute(
      "href",
      "/app/acciones/casa",
    );
  });

  it("no muestra Registros para roles distintos de Coordinador", () => {
    setupSideBar({ user: { role: { name: "Administrador" } } });
    renderSideBar();

    expect(screen.queryByRole("link", { name: "Acciones registradas" })).toBeNull();
  });
});

describe("SideBar expandida", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSideBar({ expanded: true });
  });

  it("el botón toggle tiene aria-label Contraer menú", () => {
    renderSideBar();

    expect(
      screen.getByRole("button", { name: "Contraer menú" }),
    ).toBeInTheDocument();
  });

  it("el botón toggle tiene aria-expanded true", () => {
    renderSideBar();

    const btn = screen.getByRole("button", { name: "Contraer menú" });

    expect(btn).toHaveAttribute("aria-expanded", "true");
  });
});

describe("SideBar mobile abierta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSideBar({ mobileOpen: true });
  });

  it("muestra el nav mobile", () => {
    renderSideBar();

    expect(
      screen.getByRole("navigation", { name: "Menú principal" }),
    ).toBeInTheDocument();
  });

  it("el botón hamburguesa cambia a Cerrar menú", () => {
    renderSideBar();

    expect(
      screen.getByRole("button", { name: "Cerrar menú" }),
    ).toBeInTheDocument();
  });

  it("el botón hamburguesa tiene aria-expanded true", () => {
    renderSideBar();

    const btn = screen.getByRole("button", { name: "Cerrar menú" });

    expect(btn).toHaveAttribute("aria-expanded", "true");
  });
});

describe("SideBar - rutas por rol", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("manda Vacaciones a solicitudes cuando el usuario es Coordinador", () => {
    setupSideBar({
      expanded: true,
      user: { role: { name: "Coordinador" } },
    });

    renderSideBar();

    expect(screen.getByRole("link", { name: "Vacaciones" })).toHaveAttribute(
      "href",
      "/app/vacaciones/solicitudes",
    );
  });

  it("manda Vacaciones a /app/vacaciones cuando el usuario no es Coordinador", () => {
    setupSideBar({
      expanded: true,
      user: { role: { name: "Administrador" } },
    });

    renderSideBar();

    expect(screen.getByRole("link", { name: "Vacaciones" })).toHaveAttribute(
      "href",
      "/app/vacaciones",
    );
  });

  it("también reconoce roleName plano como Coordinador", () => {
    setupSideBar({
      expanded: true,
      user: { roleName: "Coordinador" },
    });

    renderSideBar();

    expect(screen.getByRole("link", { name: "Vacaciones" })).toHaveAttribute(
      "href",
      "/app/vacaciones/solicitudes",
    );
  });

  it("también reconoce role como string Coordinador", () => {
    setupSideBar({
      expanded: true,
      user: { role: "Coordinador" },
    });

    renderSideBar();

    expect(screen.getByRole("link", { name: "Vacaciones" })).toHaveAttribute(
      "href",
      "/app/vacaciones/solicitudes",
    );
  });
});
