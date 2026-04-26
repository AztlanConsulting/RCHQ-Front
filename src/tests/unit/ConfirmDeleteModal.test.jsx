// tests/unit/ConfirmDeleteModal.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDeleteModal from "../../Components/Organism/ConfirmDeleteModal";

const makeProps = (overrides = {}) => ({
  label: "CV",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  loading: false,
  ...overrides,
});

describe("ConfirmDeleteModal — renderizado", () => {
  it("no renderiza nada cuando label es null", () => {
    const { container } = render(<ConfirmDeleteModal {...makeProps({ label: null })} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el label del documento en el mensaje", () => {
    render(<ConfirmDeleteModal {...makeProps({ label: "Acta de Nacimiento" })} />);
    expect(screen.getByText("Acta de Nacimiento")).toBeInTheDocument();
  });

  it("muestra el botón 'Eliminar' cuando no está cargando", () => {
    render(<ConfirmDeleteModal {...makeProps()} />);
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
  });

  it("muestra 'Eliminando...' cuando loading=true", () => {
    render(<ConfirmDeleteModal {...makeProps({ loading: true })} />);
    expect(screen.getByText("Eliminando...")).toBeInTheDocument();
  });

  it("deshabilita el botón de confirmar cuando loading=true", () => {
    render(<ConfirmDeleteModal {...makeProps({ loading: true })} />);
    expect(screen.getByText("Eliminando...").closest("button")).toBeDisabled();
  });
});

describe("ConfirmDeleteModal — interacción", () => {
  it("llama a onConfirm cuando el usuario hace click en Eliminar", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteModal {...makeProps({ onConfirm })} />);
    fireEvent.click(screen.getByRole("button", { name: /^eliminar$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama a onCancel cuando el usuario hace click en Cancelar", () => {
    const onCancel = vi.fn();
    render(<ConfirmDeleteModal {...makeProps({ onCancel })} />);
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});